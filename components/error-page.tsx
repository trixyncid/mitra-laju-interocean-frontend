import { Button } from "./ui/button";
import { DialogContent, DialogDescription, DialogHeader, Dialog, DialogFooter, DialogTitle } from "./ui/dialog";

export default function ErrorPage({
    title = "Failed to load data",
    message = "Failed to load data due to network error. Please check your internet connection.",
}: {
    title?: string
    message?: string
}) {
    return (
        <Dialog open={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription>{message}</DialogDescription>
                <DialogFooter>
                    <Button variant="destructive" onClick={() => window.location.reload()}>Retry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}