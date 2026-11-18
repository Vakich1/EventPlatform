'use client'

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n';

function pad(n: number) {
    return String(n).padStart(2, '0');
}

function toLocalValue(d: Date) {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function parseValue(value: string) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function startOfMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
}

function daysInMonth(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function sameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DateTimePickerProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    min?: string;
    invalid?: boolean;
    placeholder?: string;
}

export default function DateTimePicker({ id, value, onChange, min, invalid, placeholder }: DateTimePickerProps) {
    const { t, language } = useTranslation();
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const selected = parseValue(value);
    const [view, setView] = useState(() => startOfMonth(selected ?? new Date()));
    const [hour, setHour] = useState(selected?.getHours() ?? 10);
    const [minute, setMinute] = useState(selected?.getMinutes() ?? 0);
    const minDate = parseValue(min ?? '');

    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, [open]);

    useEffect(() => {
        if (selected) {
            setView(startOfMonth(selected));
            setHour(selected.getHours());
            setMinute(selected.getMinutes());
        }
    }, [value]);

    const locale = language === 'en' ? 'en-US' : 'ru-RU';
    const monthLabel = view.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const weekdays = useMemo(() => {
        const base = new Date(2024, 0, 1);
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(base);
            d.setDate(base.getDate() + i);
            return d.toLocaleDateString(locale, { weekday: 'short' });
        });
    }, [locale]);

    const cells = useMemo(() => {
        const first = startOfMonth(view);
        const offset = (first.getDay() + 6) % 7;
        const total = daysInMonth(view);
        const out: (Date | null)[] = [];
        for (let i = 0; i < offset; i++) out.push(null);
        for (let day = 1; day <= total; day++) out.push(new Date(view.getFullYear(), view.getMonth(), day));
        while (out.length % 7 !== 0) out.push(null);
        return out;
    }, [view]);

    const display = selected
        ? selected.toLocaleString(locale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

    const pickDay = (day: Date) => {
        const next = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, minute);
        onChange(toLocalValue(next));
    };

    const applyTime = (h: number, m: number) => {
        setHour(h);
        setMinute(m);
        const base = selected ?? new Date(view.getFullYear(), view.getMonth(), view.getDate(), h, m);
        const next = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h, m);
        onChange(toLocalValue(next));
    };

    const disabledDay = (day: Date) => {
        if (!minDate) return false;
        const floor = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        return day < floor;
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                id={id}
                aria-invalid={invalid || undefined}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen(v => !v)}
                className={`input input-with-icon flex w-full items-center text-left ${invalid ? 'border-danger-solid' : ''} ${display ? 'text-ink' : 'text-placeholder'}`}
            >
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-placeholder" aria-hidden="true" />
                <span className="truncate">{display || placeholder || t('ui.picker.chooseDate')}</span>
            </button>
            {open && (
                <div role="dialog" aria-label={t('ui.picker.calendar')} className="absolute left-0 top-[calc(100%+8px)] z-40 w-[320px] rounded-[14px] border border-line bg-white p-4 shadow-card-hover">
                    <div className="mb-3 flex items-center justify-between">
                        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} aria-label={t('ui.picker.prevMonth')}>
                            <ChevronLeft aria-hidden="true" />
                        </button>
                        <p className="text-sm font-semibold capitalize text-ink">{monthLabel}</p>
                        <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} aria-label={t('ui.picker.nextMonth')}>
                            <ChevronRight aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mb-1 grid grid-cols-7 gap-0">
                        {weekdays.map(d => (
                            <span key={d} className="py-1 text-center text-xs font-medium text-subtle">{d}</span>
                        ))}
                    </div>
                    <div className="mb-3 grid grid-cols-7 gap-0">
                        {cells.map((day, i) => {
                            if (!day) return <span key={`e-${i}`} className="h-9" />;
                            const active = selected ? sameDay(day, selected) : false;
                            const off = disabledDay(day);
                            return (
                                <button
                                    key={day.toISOString()}
                                    type="button"
                                    disabled={off}
                                    onClick={() => pickDay(day)}
                                    className={`h-9 rounded-[10px] text-sm font-medium ${active ? 'bg-brand-600 text-white' : off ? 'text-placeholder' : 'text-ink hover:bg-brand-50'}`}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mb-3 flex items-center gap-2">
                        <span className="text-sm font-medium text-muted">{t('ui.picker.time')}</span>
                        <select
                            className="input min-h-9 flex-1 py-1.5"
                            value={hour}
                            onChange={e => applyTime(Number(e.target.value), minute)}
                            aria-label={t('ui.picker.hour')}
                        >
                            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad(h)}</option>)}
                        </select>
                        <span className="font-semibold text-ink">:</span>
                        <select
                            className="input min-h-9 flex-1 py-1.5"
                            value={minute}
                            onChange={e => applyTime(hour, Number(e.target.value))}
                            aria-label={t('ui.picker.minute')}
                        >
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(m => <option key={m} value={m}>{pad(m)}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>{t('cancel')}</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>{t('ui.picker.apply')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
