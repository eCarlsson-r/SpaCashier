import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function FormWrapper({ title, isLoading, onSubmit, children }: { title: string; isLoading: boolean; onSubmit: () => void; children: React.ReactNode }) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[20px] w-[100px] rounded-full" /> : children}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline">Cancel</Button>
                <Button onClick={onSubmit}>Save Record</Button>
            </CardFooter>
        </Card>
    );
}