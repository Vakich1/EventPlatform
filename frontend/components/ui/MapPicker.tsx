'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useTranslation } from '@/i18n';

const TILE = 256;
const DEFAULT = { lat: 53.9045, lng: 27.5615, zoom: 13 };

function clamp(n: number, a: number, b: number) {
    return Math.min(b, Math.max(a, n));
}

function project(lat: number, lng: number, zoom: number) {
    const scale = TILE * 2 ** zoom;
    const x = ((lng + 180) / 360) * scale;
    const sin = Math.sin((lat * Math.PI) / 180);
    const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
    return { x, y, scale };
}

function unproject(x: number, y: number, zoom: number) {
    const scale = TILE * 2 ** zoom;
    const lng = (x / scale) * 360 - 180;
    const n = Math.PI - (2 * Math.PI * y) / scale;
    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
    return { lat, lng };
}

interface MapPickerProps {
    open: boolean;
    initialAddress?: string;
    onClose: () => void;
    onConfirm: (address: string) => void;
}

export default function MapPicker({ open, initialAddress, onClose, onConfirm }: MapPickerProps) {
    const { t } = useTranslation();
    const mapRef = useRef<HTMLDivElement>(null);
    const [center, setCenter] = useState(DEFAULT);
    const [marker, setMarker] = useState({ lat: DEFAULT.lat, lng: DEFAULT.lng });
    const [address, setAddress] = useState(initialAddress || '');
    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState({ w: 560, h: 280 });

    useEffect(() => {
        if (!open) return;
        setAddress(initialAddress || '');
        const el = mapRef.current;
        if (!el) return;
        const sync = () => setSize({ w: el.clientWidth, h: el.clientHeight });
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(el);
        return () => ro.disconnect();
    }, [open, initialAddress]);

    const tiles = useMemo(() => {
        const p = project(center.lat, center.lng, center.zoom);
        const originX = p.x - size.w / 2;
        const originY = p.y - size.h / 2;
        const x0 = Math.floor(originX / TILE);
        const y0 = Math.floor(originY / TILE);
        const x1 = Math.floor((originX + size.w) / TILE);
        const y1 = Math.floor((originY + size.h) / TILE);
        const max = 2 ** center.zoom;
        const list: { key: string; left: number; top: number; url: string }[] = [];
        for (let ty = y0; ty <= y1; ty++) {
            for (let tx = x0; tx <= x1; tx++) {
                const wrappedX = ((tx % max) + max) % max;
                if (ty < 0 || ty >= max) continue;
                list.push({
                    key: `${center.zoom}-${wrappedX}-${ty}`,
                    left: tx * TILE - originX,
                    top: ty * TILE - originY,
                    url: `https://tile.openstreetmap.org/${center.zoom}/${wrappedX}/${ty}.png`,
                });
            }
        }
        const m = project(marker.lat, marker.lng, center.zoom);
        return {
            list,
            pin: { left: m.x - originX, top: m.y - originY },
        };
    }, [center, marker, size]);

    const reverseGeocode = async (lat: number, lng: number) => {
        setLoading(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`, {
                headers: { Accept: 'application/json' },
            });
            if (!res.ok) throw new Error('geo');
            const data = await res.json();
            const label = data.display_name as string | undefined;
            setAddress(label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } finally {
            setLoading(false);
        }
    };

    const onMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const p = project(center.lat, center.lng, center.zoom);
        const world = unproject(p.x - size.w / 2 + px, p.y - size.h / 2 + py, center.zoom);
        const next = { lat: clamp(world.lat, -85, 85), lng: ((world.lng + 540) % 360) - 180 };
        setMarker(next);
        reverseGeocode(next.lat, next.lng);
    };

    if (!open) return null;

    return (
        <Modal onClose={onClose} label={t('ui.map.title')} width="max-w-[560px]">
            <div className="flex items-center justify-between px-6 pt-5">
                <h2 className="text-lg font-semibold text-ink">{t('ui.map.title')}</h2>
                <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label={t('cancel')}>
                    <X aria-hidden="true" />
                </button>
            </div>
            <div className="relative mt-4 h-[280px] overflow-hidden bg-brand-50">
                <div ref={mapRef} className="absolute inset-0 cursor-crosshair" onClick={onMapClick} role="presentation">
                    {tiles.list.map(tile => (
                        <img key={tile.key} src={tile.url} alt="" className="pointer-events-none absolute h-64 w-64 max-w-none" style={{ left: tile.left, top: tile.top }} draggable={false} />
                    ))}
                    <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-full text-brand-600" style={{ left: tiles.pin.left, top: tiles.pin.top }}>
                        <MapPin className="h-8 w-8 drop-shadow" aria-hidden="true" />
                    </span>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-2">
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCenter(c => ({ ...c, zoom: clamp(c.zoom - 1, 3, 18) }))}>−</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setCenter(c => ({ ...c, zoom: clamp(c.zoom + 1, 3, 18) }))}>+</button>
                </div>
            </div>
            <div className="flex flex-col gap-3 p-6">
                <p className="text-sm text-muted">{t('ui.map.hint')}</p>
                <div>
                    <label className="label" htmlFor="map-address">{t('ui.map.address')}</label>
                    <div className="relative">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                        <input
                            id="map-address"
                            className="input input-with-icon"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder={t('ui.map.addressPlaceholder')}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button type="button" className="btn btn-secondary" onClick={onClose}>{t('cancel')}</button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        disabled={!address.trim() || loading}
                        onClick={() => onConfirm(address.trim())}
                    >
                        <MapPin aria-hidden="true" />
                        {loading ? t('ui.map.loading') : t('ui.map.confirm')}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
