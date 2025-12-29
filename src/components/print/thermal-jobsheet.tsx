import React, { forwardRef } from 'react';

export const ThermalReceipt = forwardRef(({ receiptNumber, branch, items, payments, changeAmount }: any, ref: any) => {
    const formatCurr = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    const receiptStyles = `
        @media print {
            .thermal-print-container {
                width: 80mm;
                padding: 2mm;
                font-family: 'Courier New', Courier, monospace; /* Monospace is king for alignment */
                font-size: 11px;
                line-height: 1.2;
                color: #000;
                background-color: #fff;
                -webkit-print-color-adjust: exact;
            }
            
            /* Force sharp text rendering */
            * {
                -webkit-font-smoothing: none;
                text-rendering: optimizeSpeed;
            }

            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .bold { font-weight: 700; }
            
            .dashed-line {
                border-top: 1px dashed #000;
                margin: 5px 0;
                width: 100%;
            }

            /* Prevent page breaks inside the receipt */
            tr, div {
                page-break-inside: avoid;
            }
            
            @page {
                margin: 0;
                size: 80mm auto; /* Critical for continuous roll printers */
            }
        }
    `;

    return (
        <div ref={ref} className="thermal-print-container">
            <style>{receiptStyles}</style>

            {/* Header Section */}
            <div className="text-center">
                <img src="/images/logo.png" className="mx-auto" style={{
                    width: '120px',
                    filter: 'grayscale(100%) contrast(150%)' // Force it to be sharp B&W
                }} alt="logo" onLoad={() => console.log("Logo loaded for printing")} />
                <div>{branch?.address}</div>
                <div>{branch?.city}, {branch?.country}</div>
                <div>Telp: {branch?.phone}</div>
            </div>


            <div className="dashed-line" />

            {/* Receipt Info */}
            <div style={{ fontSize: '11px' }}>
                <div>No: <span className="bold">{receiptNumber}</span></div>
                <div>Date: {new Date().toLocaleString('id-ID')}</div>
            </div>

            <div className="dashed-line" />

            {/* Items Table */}
            <table style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead>
                    <tr>
                        <th style={{ width: '50%', textAlign: 'left' }}>Item</th>
                        <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '35%', textAlign: 'right' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: any, i: number) => (
                        <tr key={i}>
                            {item.redeem_type === 'voucher' && (
                                <td style={{ overflowWrap: 'break-word' }}>
                                    {item.treatment_name || item.name}
                                    {item.description}
                                </td>
                            )}
                            {item.redeem_type === 'walkin' && (
                                <td style={{ overflowWrap: 'break-word' }}>
                                    {item.treatment_name || item.name}<br />Walk-In
                                </td>
                            )}
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>
                                {new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="dashed-line" />

            {/* Payments & Change Section */}
            <div className="space-y-1">
                {payments.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                            {p.method === 'card' && (
                                <span>{p.details.card_edc.toUpperCase()} {p.method.toUpperCase()} {p.details.card_type.toUpperCase()} </span>
                            )}
                            {p.method === 'ewallet' && (
                                <span>{p.method.toUpperCase()} {p.details.wallet_edc.toUpperCase()}</span>
                            )}
                            {p.method === 'voucher' && (
                                <span>{p.method.toUpperCase()} {p.details.voucher_provider.toUpperCase()}</span>
                            )}
                            {p.method === 'cash' && (
                                <span>{p.method.toUpperCase()}</span>
                            )}
                            {p.method === 'qr' && (
                                <span>{p.method.toUpperCase()} {p.details.qr_edc}</span>
                            )}
                        </span>
                        <span>{formatCurr(p.amount)}</span>
                    </div>
                ))}

                {changeAmount > 0 && (
                    <div className="bold" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                        <span>KEMBALI (CHANGE)</span>
                        <span>{formatCurr(changeAmount)}</span>
                    </div>
                )}
            </div>

            <div className="dashed-line" />
            <div className="text-center bold">TERIMA KASIH</div>
            <div className="text-center" style={{ fontSize: '10px' }}>Powered by Carlsson POS</div>
        </div>
    );
});