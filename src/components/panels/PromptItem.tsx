import React, { JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PromptFragment, HistoryLogEntry } from "@/types/prompts";

/**
 * Props for the PromptItem component
 */
export interface PromptItemProps {
  /**
   * The prompt fragment data to display
   */
  prompt: PromptFragment;
  /**
   * Event handler for when the prompt is selected
   */
  onSelect?: (prompt: PromptFragment) => void;
  /**
   * Event handler for when the prompt is updated
   */
  onUpdate?: (
    promptId: string,
    newText: string,
    persistChange: boolean
  ) => void;
  /**
   * Event handler for when a historical version is restored
   */
  onRestoreVersion?: (promptId: string, historyEntry: HistoryLogEntry) => void;
  /**
   * Event handler for when the prompt is deprecated (soft delete)
   */
  onDeprecate?: (promptId: string) => Promise<boolean> | void;
  /**
   * Whether the prompt is currently selected
   */
  isSelected?: boolean;
  /**
   * Whether the selection should behave like a radio button (single selection)
   */
  selectionMode?: 'multiple' | 'single';
}

/**
 * Component that displays a single prompt item with edit capabilities
 * @param props - Component props
 * @returns JSX.Element
 */
export function PromptItem({
  prompt,
  onSelect,
  onUpdate,
  onRestoreVersion,
  onDeprecate,
  isSelected = false,
  selectionMode = 'multiple',
}: PromptItemProps): JSX.Element {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(prompt.text);
  const [showHistory, setShowHistory] = React.useState(false);
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);

  // Sort history entries by timestamp in descending order (newest first)
  const sortedHistory = [...prompt.history_log].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleEdit = () => {
    setEditText(prompt.text);
    setIsEditing(true);
  };

  const handleUpdate = (persistChange: boolean) => {
    if (onUpdate) {
      onUpdate(prompt.id, editText, persistChange);
    }
    setIsEditing(false);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(prompt);
    }
  };

  const handleRestoreVersion = (historyEntry: HistoryLogEntry) => {
    if (onRestoreVersion) {
      onRestoreVersion(prompt.id, historyEntry);
    }
    setShowHistory(false);
  };

  const handleDeprecate = async () => {
    if (onDeprecate) {
      const success = await onDeprecate(prompt.id);
      if (success) {
        setConfirmingDelete(false);
      }
    }
  };

  return (
    <Card className={`w-full mb-4 ${prompt.deprecated ? "opacity-50" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium">
            {prompt.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-secondary text-secondary-foreground text-xs rounded-full px-2 py-1 mr-1"
              >
                {tag}
              </span>
            ))}
          </CardTitle>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleEdit}
                    className="h-8 w-8"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit prompt</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowHistory(true)}
                    className="h-8 w-8"
                  >
                    <HistoryIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View history</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isSelected ? "secondary" : "default"}
                    size="icon"
                    onClick={handleSelect}
                    className="h-8 w-8"
                  >
                    {isSelected ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      selectionMode === 'multiple' ? <PlusIcon className="h-4 w-4" /> : <CircleIcon className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isSelected ? "Unselect prompt" : "Select prompt"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setConfirmingDelete(true)}
                    className="h-8 w-8"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete prompt</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription>
          {prompt.associated_model_type && (
            <span className="mr-2">Model: {prompt.associated_model_type}</span>
          )}
          <span className="mr-2">Uses: {prompt.uses}</span>
          {prompt.last_used && (
            <span>
              Last used: {new Date(prompt.last_used).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{prompt.text}</p>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground justify-between">
        <span>Created by: {prompt.created_by}</span>
        <span>Length: {prompt.length} chars</span>
      </CardFooter>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Make changes to the prompt text. Save changes for the current
              session only or persist them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="prompt-text">Prompt Text</Label>
              <textarea
                id="prompt-text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={5}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleUpdate(false)}>
              Update for Session
            </Button>
            <Button onClick={() => handleUpdate(true)}>Persist Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="sm:max-w-[525px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prompt History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {sortedHistory.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No history available
              </p>
            ) : (
              sortedHistory.map((entry, index) => (
                <div key={index} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Restore
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Restore</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to restore this version? This
                            will update the prompt to this historical version.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button onClick={() => handleRestoreVersion(entry)}>
                            Confirm
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This will mark it as
              deprecated and it will no longer appear in the prompt store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeprecate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Simple icon components for the buttons
function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
