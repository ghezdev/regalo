"use client";

import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { plazaMap } from "@/game/data/maps/plaza";
import { REGALO_REALTIME_CHANNEL } from "@/game/realtime";
import type { PlayerUpdate } from "@/game/types/game";
import {
  createInitialMapPresence,
  getMapMarker,
  MAP_PRESENCE_TIMEOUT_MS,
  reducePlayerUpdate,
} from "./model";

const MAP_IMAGE_SRC = "/sprites/regalo%20naomi%20plaza.webp";

export function MapaView() {
  const [presence, setPresence] = useState(createInitialMapPresence);
  const [now, setNow] = useState(() => Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [mapSize, setMapSize] = useState({ width: plazaMap.width, height: plazaMap.height });

  useEffect(() => {
    const updateSize = () => {
      const element = mapRef.current;
      if (!element) {
        return;
      }

      setMapSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      setError("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const channel: RealtimeChannel = supabase.channel(REGALO_REALTIME_CHANNEL);

    channel
      .on("broadcast", { event: "position" }, ({ payload }) => {
        setPresence((current) => reducePlayerUpdate(current, payload as PlayerUpdate, Date.now()));
      })
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
        if (status === "CHANNEL_ERROR") {
          setError("No se pudo conectar al canal realtime.");
        }
      });

    return () => {
      void channel.unsubscribe();
    };
  }, []);

  const naomiMarker = getMapMarker(presence.naomi, mapSize.width, mapSize.height, now);
  const guilleMarker = getMapMarker(presence.guillermo, mapSize.width, mapSize.height, now);
  const visibleMarkers = [naomiMarker, guilleMarker].filter(
    (marker): marker is NonNullable<typeof marker> => Boolean(marker?.connected),
  );

  return (
    <main className="mapa-page">
      <div className="mapa-header">
        <h1>/mapa</h1>
        <p>
          Estado realtime: {isConnected ? "conectado" : "conectando"} · timeout{" "}
          {Math.round(MAP_PRESENCE_TIMEOUT_MS / 1000)}s
        </p>
        {error ? <p className="mapa-error">{error}</p> : null}
      </div>

      <div className="mapa-frame">
        <div className="mapa-canvas" ref={mapRef}>
          <Image
            alt="Mapa completo de la plaza"
            className="mapa-image"
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            src={MAP_IMAGE_SRC}
          />

          {visibleMarkers.map((marker) => (
            <div
              className="mapa-marker"
              key={marker.text}
              style={{
                left: `${marker.x}px`,
                top: `${marker.y}px`,
              }}
            >
              {marker.text}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
