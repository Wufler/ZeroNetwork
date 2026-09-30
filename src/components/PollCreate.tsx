"use client";

import { addDays, format, isValid, startOfDay } from "date-fns";
import { CalendarDays, ChevronDown, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 250;
const MAX_ANSWERS = 10;

export default function PollCreate({
  isCreating,
  onCreate,
}: {
  isCreating: boolean;
  onCreate: (
    question: string,
    answers: string[],
    until?: Date,
  ) => Promise<void>;
}) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([
    { id: 0, text: "" },
    { id: 1, text: "" },
  ]);
  const nextAnswerId = useRef(2);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const [timed, setTimed] = useState(false);
  const [date, setDate] = useState<Date>(() =>
    addDays(startOfDay(new Date()), 1),
  );
  const [time, setTime] = useState("18:00");
  const [dateOpen, setDateOpen] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [timeZone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll("_", " "),
  );

  const deadline = new Date(date);
  const [hours, minutes] = time.split(":").map(Number);
  deadline.setHours(hours, minutes, 0, 0);
  const validDeadline = isValid(deadline) && deadline.getTime() > Date.now();
  const canCreate =
    question.trim().length > 0 &&
    answers.every((answer) => answer.text.trim()) &&
    (!timed || validDeadline);

  return (
    <DialogContent
      initialFocus={questionRef}
      className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
    >
      <form
        className="flex min-h-0 flex-col"
        onSubmit={async (event) => {
          event.preventDefault();
          if (isCreating) return;
          if (
            timed &&
            (!isValid(deadline) || deadline.getTime() <= Date.now())
          ) {
            setScheduleError("Choose a closing date and time in the future.");
            return;
          }
          if (!canCreate) return;
          await onCreate(
            question.trim(),
            answers.map((answer) => answer.text.trim()),
            timed ? deadline : undefined,
          );
        }}
      >
        <DialogHeader className="shrink-0 px-5 pt-6 pb-5 pr-12 sm:px-6 sm:pr-12">
          <DialogTitle>Create a poll</DialogTitle>
          <DialogDescription>
            Give the community something to think about.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6">
          <FieldGroup className="gap-6">
            <Field>
              <div className="flex items-baseline justify-between gap-3">
                <FieldLabel htmlFor="poll-question">Question</FieldLabel>
                <span
                  className="text-xs tabular-nums text-muted-foreground"
                  aria-hidden="true"
                >
                  {question.length}/{MAX_LENGTH}
                </span>
              </div>
              <Textarea
                ref={questionRef}
                id="poll-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={MAX_LENGTH}
                placeholder="What should we play next?"
                rows={2}
                className="min-h-20 resize-none"
                disabled={isCreating}
                required
              />
            </Field>

            <FieldSet className="gap-3" disabled={isCreating}>
              <FieldLegend variant="label" className="mb-2">
                Answer options
              </FieldLegend>
              <div ref={answersRef} className="flex flex-col gap-2">
                {answers.map((answer, index) => (
                  <div key={answer.id} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="w-5 shrink-0 text-center text-xs tabular-nums text-muted-foreground"
                    >
                      {index + 1}
                    </span>
                    <Input
                      aria-label={`Answer ${index + 1}`}
                      placeholder={`Option ${index + 1}`}
                      value={answer.text}
                      maxLength={MAX_LENGTH}
                      required
                      disabled={isCreating}
                      className="min-w-0 flex-1"
                      onChange={(event) =>
                        setAnswers((current) =>
                          current.map((item) =>
                            item.id === answer.id
                              ? { ...item, text: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                    {answers.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove answer ${index + 1}`}
                        disabled={isCreating}
                        onClick={() => {
                          setAnswers((current) =>
                            current.filter((item) => item.id !== answer.id),
                          );
                          requestAnimationFrame(() =>
                            answersRef.current
                              ?.querySelectorAll("input")
                              [Math.max(0, index - 1)]?.focus(),
                          );
                        }}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={isCreating || answers.length >= MAX_ANSWERS}
                  onClick={() => {
                    const id = nextAnswerId.current++;
                    setAnswers((current) => [...current, { id, text: "" }]);
                    requestAnimationFrame(() => {
                      const inputs =
                        answersRef.current?.querySelectorAll("input");
                      inputs?.[inputs.length - 1]?.focus();
                    });
                  }}
                >
                  <Plus data-icon="inline-start" />
                  Add option
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {answers.length} of {MAX_ANSWERS} options
                </span>
              </div>
            </FieldSet>

            <Separator />

            <FieldGroup className="gap-4">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel id="poll-timed-label" htmlFor="poll-timed">
                    Close voting automatically
                  </FieldLabel>
                  <FieldDescription>
                    {timed
                      ? "Choose when this poll stops accepting votes."
                      : "Leave it open until you end it manually."}
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="poll-timed"
                  checked={timed}
                  disabled={isCreating}
                  onCheckedChange={setTimed}
                />
              </Field>
              {timed && (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-3">
                    <Field>
                      <FieldLabel htmlFor="poll-date">Closing date</FieldLabel>
                      <Popover open={dateOpen} onOpenChange={setDateOpen}>
                        <PopoverTrigger
                          id="poll-date"
                          render={<Button variant="outline" />}
                          className="w-full justify-between"
                          disabled={isCreating}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <CalendarDays data-icon="inline-start" />
                            <span className="truncate">
                              {format(date, "MMM d, yyyy")}
                            </span>
                          </span>
                          <ChevronDown data-icon="inline-end" />
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          className="w-auto p-0"
                          aria-label="Choose closing date"
                        >
                          <Calendar
                            mode="single"
                            required
                            selected={date}
                            defaultMonth={date}
                            disabled={{ before: startOfDay(new Date()) }}
                            onSelect={(value) => {
                              setDate(value);
                              setScheduleError("");
                              setDateOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </Field>
                    <Field data-invalid={!validDeadline || !!scheduleError}>
                      <FieldLabel htmlFor="poll-time">Time</FieldLabel>
                      <Input
                        id="poll-time"
                        type="time"
                        value={time}
                        disabled={isCreating}
                        required
                        aria-invalid={!validDeadline || !!scheduleError}
                        aria-describedby="poll-deadline-help"
                        onChange={(event) => {
                          setTime(event.target.value);
                          setScheduleError("");
                        }}
                      />
                    </Field>
                  </div>
                  <div id="poll-deadline-help">
                    {!validDeadline || scheduleError ? (
                      <FieldError>
                        {scheduleError ||
                          "Choose a closing date and time in the future."}
                      </FieldError>
                    ) : (
                      <FieldDescription>
                        Closes {format(deadline, "MMM d 'at' HH:mm")} ·{" "}
                        {timeZone}
                      </FieldDescription>
                    )}
                  </div>
                </>
              )}
            </FieldGroup>
          </FieldGroup>
        </div>

        <DialogFooter className="m-0 shrink-0 flex-row justify-end px-5 py-4 sm:px-6">
          <DialogClose
            render={<Button variant="outline" />}
            disabled={isCreating}
          >
            Cancel
          </DialogClose>
          <Button type="submit" disabled={isCreating || !canCreate}>
            {isCreating && (
              <Loader2
                data-icon="inline-start"
                className="animate-spin motion-reduce:animate-none"
              />
            )}
            {isCreating ? "Creating…" : "Create poll"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
