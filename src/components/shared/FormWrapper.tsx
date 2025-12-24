import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function FormWrapper({ title, isLoading, children }: { title: string; isLoading: boolean; children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-gray-700">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? <Skeleton className="h-[20px] w-[100px] rounded-full" /> : children}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline">Cancel</Button>
                <Button className="bg-sky-600 hover:bg-sky-700" type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
}