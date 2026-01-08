"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { IconAdjustments, IconCash, IconCircle, IconCircleFilled, IconEdit, IconFerry, IconGlobe, IconUser, IconWorld } from "@tabler/icons-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IconPlus, IconShipOff } from "@tabler/icons-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function ShipmentDetailPage() {
    const [ empty, setEmpty ] = useState<boolean>(false);

    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">#SHP-2023-001</h1>
                <p className="text-sm text-slate-400">Created on Dec 31, 2025 by Winsten Coellins</p>
            </div>

            {
                !empty ?
                <div>
                    {/* Cards Information */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
                        <Card>
                            <CardContent>
                                <div>
                                    <div className="flex items-center">
                                        <IconUser className="text-gray-500 h-4 w-4" />
                                        <p className="text-xs ml-1 text-gray-500 font-semibold">CLIENT</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-lg font-bold">XW Company</p>
                                        <p className="text-sm text-gray-500">XWC</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div>
                                    <div className="flex items-center">
                                        <IconUser className="text-gray-500 h-4 w-4" />
                                        <p className="text-xs ml-1 text-gray-500 font-semibold">CLIENT</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-lg font-bold">XW Company</p>
                                        <p className="text-sm text-gray-500">XWC</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div>
                                    <div className="flex items-center">
                                        <IconUser className="text-gray-500 h-4 w-4" />
                                        <p className="text-xs ml-1 text-gray-500 font-semibold">CLIENT</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-lg font-bold">XW Company</p>
                                        <p className="text-sm text-gray-500">XWC</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent>
                                <div>
                                    <div className="flex items-center">
                                        <IconUser className="text-gray-500 h-4 w-4" />
                                        <p className="text-xs ml-1 text-gray-500 font-semibold">CLIENT</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-lg font-bold">XW Company</p>
                                        <p className="text-sm text-gray-500">XWC</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipment Details */}
                    <div className="flex items-start justify-between">
                        <Card className="w-9/12 mr-4">
                            <CardContent>
                                <div className="flex items-center">
                                    <IconAdjustments className="text-orange-500 h-6 w-6" />
                                    <p className="ml-2 font-bold">Operational Details</p>
                                </div>

                                <div className="mt-8 grid grid-cols-4 gap-4">
                                    <div>
                                        <h4 className="text-gray-500 text-xs font-semibold">SHIPMENT TYPE</h4>
                                        <p className="flex items-center font-bold">
                                            <IconWorld className="inline-block mr-2 text-gray-500" />
                                            Import
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-xs font-semibold">VESSEL / VOYAGE</h4>
                                        <p className="flex items-center font-bold">
                                            <IconFerry className="inline-block mr-2 text-gray-500" />
                                            Maersk Line / ML123
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-xs font-semibold">BOOKING NO.</h4>
                                        <p className="flex items-center font-bold">
                                            BK-2025-3112
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-xs font-semibold">BILL OF LADING</h4>
                                        <p className="flex items-center font-bold">
                                            BL-2025-3112
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="my-8">
                                    <Card>
                                        <CardContent className="flex items-center justify-around">
                                            {/* Departure Port and Loading Port */}
                                            <div className="flex flex-col items-start">
                                                <div className="flex items-start my-4">
                                                    <IconCircle className="text-blue-500 h-4 w-4" />

                                                    <div className="ml-2">
                                                        <p className="text-xs font-semibold text-gray-500">FROM LOCATION</p>
                                                        <h4 className="text-lg font-bold">Shanghai, China</h4>
                                                    </div>
                                                </div>

                                                <div className="h-10 w-0.5 border bg-gray-500 ml-1.5"></div>

                                                <div className="flex items-start my-4">
                                                    <IconCircleFilled className="text-gray-500 h-4 w-4" />

                                                    <div className="ml-2">
                                                        <p className="text-xs font-semibold text-gray-500">LOADING LOCATION</p>
                                                        <h4 className="text-lg font-bold">Yangshan Port Phase IV</h4>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-400 w-0.5 h-25"></div>

                                            <div className="flex flex-col items-start">
                                                <div className="flex items-start my-4">
                                                    <IconCircle className="text-green-500 h-4 w-4" />

                                                    <div className="ml-2">
                                                        <p className="text-xs font-semibold text-gray-500">TO LOCATION</p>
                                                        <h4 className="text-lg font-bold">Hamburg, Germany</h4>
                                                    </div>
                                                </div>

                                                <div className="h-10 w-0.5 border bg-gray-500 ml-1.5"></div>

                                                <div className="flex items-start my-4">
                                                    <IconCircleFilled className="text-gray-500 h-4 w-4" />

                                                    <div className="ml-2">
                                                        <p className="text-xs font-semibold text-gray-500">UNLOADING LOCATION</p>
                                                        <h4 className="text-lg font-bold">Container Terminal Burchardkai</h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <h4 className="font-semibold">CONTAINER MANIFEST:</h4>
                                            <p className="bg-blue-50 text-blue-500 rounded-full px-3 py-1 ml-3 border border-blue-500">Qty: 2</p>
                                            <p className="bg-purple-50 text-purple-500 rounded-full px-3 py-1 ml-3 border border-purple-500">Size: 40RF</p>
                                        </div>

                                        <Dialog>
                                            <form>
                                                <DialogTrigger asChild>
                                                    <Button className="mt-4"><IconPlus /> Add Container</Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Add New Container</DialogTitle>
                                                    </DialogHeader>
                                                    <div>
                                                        <div className="my-3">
                                                            <Label htmlFor="containerNumber" className="my-2">Container Number</Label>
                                                            <Input name="containerNumber" />
                                                        </div>
                                                        <div className="my-3">
                                                            <Label htmlFor="size" className="my-2">Seal Number</Label>
                                                            <Input name="sealNumber" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button variant="outline">Cancel</Button>
                                                        </DialogClose>
                                                        <Button type="submit">Submit</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </form>
                                        </Dialog>
                                    </div>

                                    <div>
                                        <table className="w-full mt-4">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="text-left px-4 py-2">Container Number</th>
                                                    <th className="text-left px-4 py-2">Seal Number</th>
                                                    <th className="text-left px-4 py-2">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b">
                                                    <td className="px-4 py-2">MLCU1234567</td>
                                                    <td className="px-4 py-2">SEAL001</td>
                                                    <td className="px-4 py-2">
                                                        <Dialog>
                                                            <form>
                                                                <DialogTrigger asChild>
                                                                    <Button><IconEdit /></Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogHeader>
                                                                        <DialogTitle>Edit Container</DialogTitle>
                                                                    </DialogHeader>
                                                                    <div>
                                                                        <div className="my-3">
                                                                            <Label htmlFor="containerNumber" className="my-2">Container Number</Label>
                                                                            <Input name="containerNumber" />
                                                                        </div>
                                                                        <div className="my-3">
                                                                            <Label htmlFor="size" className="my-2">Seal Number</Label>
                                                                            <Input name="sealNumber" />
                                                                        </div>
                                                                    </div>
                                                                    <DialogFooter>
                                                                        <Button variant="outline">Delete</Button>
                                                                        <Button type="submit">Submit</Button>
                                                                    </DialogFooter>
                                                                </DialogContent>
                                                            </form>
                                                        </Dialog>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Costings */}
                        <Card className="w-4/12">
                            <CardContent>
                                <div>
                                    <div className="flex items-center mb-4">
                                        <IconCash className="text-green-500 h-6 w-6" />
                                        <p className="ml-2 font-bold">Costings</p>
                                    </div>

                                    <Card className="my-4">
                                        <CardContent>
                                            <div className="flex items-end justify-between">
                                                <h4 className="text-sm font-semibold">TOTAL ESTIMATE</h4>
                                                <h2 className="text-2xl">$1,650.00</h2>
                                            </div>

                                            <Progress value={66} className="mt-4" />

                                            <div className="flex justify-between items-center font-semibold mt-2">
                                                <p className="text-sm text-slate-400">Paid: $1,000.00</p>
                                                <p className="text-sm text-slate-400">Pending: $650.00</p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div>
                                        <h4 className="text-slate-500 font-semibold text-xs">COST BREAKDOWN</h4>

                                        <div>
                                            <Card className="my-3">
                                                <CardContent className="flex justify-between items-center">
                                                    <div>
                                                        <p>Freight Cost</p>
                                                        <p className="text-sm text-slate-400 mt-1">Maersk Line</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <h4>$1,000.00</h4>
                                                        <p className="bg-green-50 text-green-500 px-2 w-fit text-sm rounded-md mt-1">Paid</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                            <Card className="my-3">
                                                <CardContent className="flex justify-between items-center">
                                                    <div>
                                                        <p>Freight Cost</p>
                                                        <p className="text-sm text-slate-400 mt-1">Maersk Line</p>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <h4>$650.00</h4>
                                                        <p className="bg-orange-50 text-orange-500 px-2 w-fit text-sm rounded-md mt-1">Unpaid</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                :
                <div>
                    {/* Empty state */}
                    <Empty className="h-full items-center justify-center border border-dotted border-black mt-4">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <IconShipOff />
                            </EmptyMedia>
                            <EmptyTitle>No Shipment Details Yet</EmptyTitle>
                            <EmptyDescription>
                            You haven&apos;t created any shipment details yet. Get started by creating
                            your shipment detail.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Dialog>
                                    <form>
                                        <DialogTrigger asChild>
                                            <Button><IconPlus /> Add Shipment Details</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Shipment Details</DialogTitle>
                                            </DialogHeader>
                                            <div>
                                                <div className="my-3">
                                                    <Label htmlFor="size" className="my-2">Size</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select size" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Size</SelectLabel>
                                                                <SelectItem value="value">20RF</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="portOfDeparture" className="my-2">Port of Departure</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select port of departure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Port Name (Code)</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="portOfDestination" className="my-2">Port of Destination</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select port of destination" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Port Name (Code)</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">Loading Location</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select port of departure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Port Name (Code)</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">Unloading Location</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select port of departure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Port Name (Code)</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">Shipment Type</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select port of departure" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Type of Shipment</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">Vessel</Label>
                                                    <Select>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select vessel" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectLabel>Vessel Name / Voyage</SelectLabel>
                                                                <SelectItem value="value">Rotterdam, Netherlands</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">ETD</Label>
                                                    <Input type="date" name="etd" />
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="description" className="my-2">ETA</Label>
                                                    <Input type="date" name="eta" />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button type="submit">Submit</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </form>
                                </Dialog>
                            </div>
                        </EmptyContent>
                    </Empty>
                </div>
            }
        </div>
    )
}