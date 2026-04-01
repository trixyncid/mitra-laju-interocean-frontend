"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"


export default function ShipmentDetailPage() {
    return (
        <div className="px-4 lg:px-6">
            <Button asChild variant="ghost" className="text-slate-500">
                <Link href={`/dashboard/shipments`}>
                    <IconArrowLeft className="text-2xl"/> Back to shipments
                </Link>
            </Button>

            <div>
                <div>
                    <h1>Shipment ID / Order Number</h1>
                    <p>Last updated on [date] by [name]</p>
                </div>
                <div>
                    {/* Shipment Operational Form */}
                    
                </div>
            </div>
        </div>
    )
}