
"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { documents as allDocuments } from "@/lib/mock-data";
import { FileText, UploadCloud, Download, Trash2, MoreVertical, Globe, Users, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClubDocument } from '@elmo/shared-types';

interface FileManagerProps {
    clubId: string;
}

export function FileManager({ clubId }: FileManagerProps) {
    const { user, role } = useAuth();
    const canManageFiles = role === 'superAdmin' || (role === 'clubManager' && user?.memberships?.some(m => m.clubId === clubId));

    const filteredDocuments = allDocuments.filter(doc => {
        if (role === 'superAdmin' || (role === 'clubManager' && user?.memberships?.some(m => m.clubId === clubId))) {
            return true; // Managers and admins see all documents
        }
        if (role === 'member') {
            return doc.visibility === 'public' || doc.visibility === 'member';
        }
        return doc.visibility === 'public'; // Guests see only public
    });

    const getVisibilityIcon = (visibility: ClubDocument['visibility']) => {
        switch (visibility) {
            case 'public': return <Globe className="h-4 w-4 text-muted-foreground" />;
            case 'member': return <Users className="h-4 w-4 text-muted-foreground" />;
            case 'manager': return <Shield className="h-4 w-4 text-muted-foreground" />;
            default: return null;
        }
    }


    return (
        <div className="space-y-4">
            {canManageFiles && (
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground">PDF, DOCX, etc.</p>
                        </div>
                        <Input id="file-upload" type="file" className="hidden" multiple />
                    </label>
                </div>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Visibility</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead className="text-right">Download</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDocuments.map((doc) => (
                            <TableRow key={doc.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        {doc.name}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {getVisibilityIcon(doc.visibility)}
                                        <span className="capitalize">{doc.visibility}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{doc.uploadedAt}</TableCell>
                                <TableCell>{doc.size}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="icon">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    {canManageFiles && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Change Visibility</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={doc.visibility}>
                                                            <DropdownMenuRadioItem value="public">Public</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="member">Members Only</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="manager">Managers Only</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

