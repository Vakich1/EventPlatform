'use client'

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useTranslation } from '@/i18n';

type InfoKind = 'organizers' | 'help' | 'terms' | 'privacy';

export default function InfoPage({ kind }: { kind: InfoKind }) {
    const { t } = useTranslation();
    const title = t(`ui.info.${kind}.title`);
    const lead = t(`ui.info.${kind}.lead`);
    const blocks = [0, 1, 2].map(i => ({
        title: t(`ui.info.${kind}.b${i}t`),
        text: t(`ui.info.${kind}.b${i}d`),
    }));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main id="main" className="mx-auto flex w-full max-w-[800px] flex-1 flex-col gap-6 px-4 pb-16 pt-8 xl:px-0">
                <Link href="/" className="btn btn-ghost btn-sm self-start">
                    <ArrowLeft aria-hidden="true" />
                    {t('ui.event.back')}
                </Link>
                <div className="flex flex-col gap-3">
                    <h1 className="text-[32px] font-bold leading-10 tracking-tight text-ink">{title}</h1>
                    <p className="text-[17px] leading-6 text-muted">{lead}</p>
                </div>
                <div className="flex flex-col gap-4">
                    {blocks.map(b => (
                        <section key={b.title} className="card flex flex-col gap-2 p-5">
                            <h2 className="text-lg font-semibold text-ink">{b.title}</h2>
                            <p className="text-[15px] leading-6 text-muted">{b.text}</p>
                        </section>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}
