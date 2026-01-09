import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { IconBuildingWarehouse, IconCash, IconContainer, IconCurrencyDollar, IconDownload, IconFile, IconPaperclip, IconPencil, IconPlus, IconReceipt, IconTrash } from "@tabler/icons-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import clsx from "clsx";

export default function CostingDetailPage() {
    return (
        <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Cost Entry: #CST-2026-001</h1>
                    <p className="text-slate-400 text-sm">Created on Dec 31, 2025 by Winsten Coellins</p>
                </div>

                <div className="flex items-center justify-between gap-x-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive"><IconTrash /> Delete</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Permanent Delete</DialogTitle>
                            </DialogHeader>
                            <DialogDescription>
                                Are you sure you want to delete the costing? Once this action is performed you will not be able to restore this costing.
                            </DialogDescription>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive">Delete</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <form>
                            <DialogTrigger asChild>
                                <Button>
                                    <IconPencil />
                                    Edit Costing
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Costing</DialogTitle>
                                </DialogHeader>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Description</Label>
                                    <Input type="text" placeholder="Enter a description" />
                                </div>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Price</Label>
                                    <Input type="text" placeholder="Enter a description" />
                                </div>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Currency</Label>
                                    <Input type="text" placeholder="Enter a description" />
                                </div>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Container Number</Label>
                                    <Input type="text" placeholder="Enter a description" />
                                </div>
                                <div className=" flex items-start gap-3">
                                    <Checkbox />
                                    <div className="grid gap-2">
                                        <Label htmlFor="" className="terms-2">VAT (PPN)</Label>
                                        <p className="text-sm text-gray-500">By clicking this checkbox, the VAT will be included in the calculation.</p>
                                    </div>
                                </div>
                                <div className=" flex items-start gap-3">
                                    <Checkbox />
                                    <div className="grid gap-2">
                                        <Label htmlFor="" className="terms-2">PPh 23</Label>
                                        <p className="text-sm text-gray-500">By clicking this checkbox, the PPh 23 will be included in the calculation.</p>
                                    </div>
                                </div>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Vendor Invoice</Label>
                                    <Input type="text" placeholder="" />
                                </div>
                                <div className="">
                                    <Label htmlFor="" className="mb-2">Vendor Name</Label>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select customer shipper" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Vendor Name (Code)</SelectLabel>
                                                <SelectItem value="value">Apple</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
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
            </div>

            {/* Costing Detail */}
            <div className="flex items-start justify-between gap-x-4">
                {/* Cost & Docs */}
                <div className="w-9/12">
                    <Card>
                        <CardContent>
                            <div>
                                <h2 className="flex items-center gap-x-2 font-bold"><IconReceipt className="w-6 h-6 text-blue-600" /> Cost Details</h2>

                                <div className="mt-8">
                                    <Label className="mb-2">Description</Label>
                                    <p className="font-semibold">Trucking Fee</p>
                                </div>

                                <div className="my-5 grid grid-cols-2">
                                    <div>
                                        <Label className="mb-2">Vendor Name</Label>
                                        <div className="flex items-center gap-x-2">
                                            <IconBuildingWarehouse className="text-slate-500" />
                                            <p className="font-semibold">XW Company Truck</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2">Container Number</Label>
                                        <div className="flex items-center gap-x-2">
                                            <IconContainer className="text-slate-500" />
                                            <p className="font-semibold">CNTR001</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-5 grid grid-cols-2">
                                    <div>
                                        <Label className="mb-2">Amount</Label>
                                        <div className="flex items-center gap-x-2">
                                            <IconCash className="text-slate-500" />
                                            <p className="font-semibold">123,000</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2">Currency</Label>
                                        <div className="flex items-center gap-x-2">
                                            <IconCurrencyDollar className="text-slate-500" />
                                            <p className="font-semibold">15,000</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-5 grid grid-cols-2">
                                    <div>
                                        <Label className="mb-2">VAT</Label>
                                        <div className="flex items-center gap-x-2">
                                            <p className={clsx("px-3 py-1 rounded-lg", true ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>Included</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="mb-2">PPh 23</Label>
                                        <div className="flex items-center gap-x-2">
                                            <p className={clsx("px-3 py-1 rounded-lg", true ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500")}>Included</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-5">
                                    <Label className="mb-2">Invoice Number</Label>
                                    <div className="flex items-center gap-x-2">
                                        <p className="font-semibold">INV-001-2025</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="my-4">
                        <CardContent className="flex items-center justify-between">
                            <div className="flex items-center gap-x-2 font-bold">
                                <IconPaperclip  className="text-blue-600" />
                                <h2>Documents & Invoices Uploads</h2>
                            </div>

                            <div className="">
                                <Dialog>
                                    <form>
                                        <DialogTrigger asChild>
                                            <Button><IconPlus /> Add Documents</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Documents</DialogTitle>
                                            </DialogHeader>
                                            <div>
                                                <div className="my-3">
                                                    <Label htmlFor="" className="my-2">Document Name</Label>
                                                    <Input type="text" placeholder="Name of your document" />
                                                </div>
                                                <div className="my-3">
                                                    <Label htmlFor="" className="my-2">Upload File</Label>
                                                    <Input type="file" />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <DialogClose>
                                                    <Button variant="outline">Cancel</Button>
                                                </DialogClose>
                                                <Button type="submit">Submit</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </form>
                                </Dialog>
                            </div>
                        </CardContent>

                        <CardContent>
                            <Card>
                                <CardContent className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="bg-slate-300 w-fit px-2 py-2 rounded-md">
                                            <IconFile />
                                        </div>

                                        <div className="ml-2">
                                            <h3 className="font-semibold">Document Name</h3>
                                            <p className="text-sm text-slate-600">filename.xlsx</p>
                                        </div>
                                    </div>

                                    <Button><IconDownload /></Button>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-3/12">
                    <Card>
                        <CardContent>
                            <CardTitle>Entry Metadata</CardTitle>
                            <div className="my-4 text-sm">
                                <div className="flex items-center justify-between my-1">
                                    <p>Created By</p>
                                    <p>Winsten Coellins</p>
                                </div>
                                <div className="flex items-center justify-between my-1">
                                    <p>Created At</p>
                                    <p>Dec 31, 2025</p>
                                </div>
                                <div className="flex items-center justify-between my-1">
                                    <p>Last Updated By</p>
                                    <p>Xhel</p>
                                </div>
                                <div className="flex items-center justify-between my-1">
                                    <p>Last Updated</p>
                                    <p>Jan 1, 2026</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}