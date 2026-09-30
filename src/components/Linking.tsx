"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProfile, saveProfile } from "@/app/actions/mentions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const empty = { mention: "", username: "", uuid: "", bio: "" };

export default function Linking({ profiles }: { profiles: Profile[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await saveProfile(form);
      toast.success("Mention saved");
      router.refresh();
      setForm(empty);
      setEditing(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not save mention. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  async function remove(profile: Profile) {
    setPending(true);
    setError("");
    try {
      await deleteProfile(profile.id);
      router.refresh();
      if (form.mention === profile.mention) {
        setForm(empty);
        setEditing(false);
      }
      toast.success("Mention removed");
    } catch {
      setError("Could not remove mention. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="outline" className="rounded-full" />}
      >
        Mentions
      </DialogTrigger>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Mentions</DialogTitle>
          <DialogDescription>
            Add profiles for @mentions in descriptions and captions. These
            details are public.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {profiles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No mentions yet. Add the first one below.
            </p>
          )}
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
            >
              <div className="min-w-0">
                <p className="font-medium wrap-anywhere">@{profile.mention}</p>
                <p className="text-sm text-muted-foreground">
                  {profile.username}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    setForm({
                      mention: profile.mention,
                      username: profile.username,
                      uuid: profile.uuid || "",
                      bio: profile.bio,
                    });
                    setEditing(true);
                    setError("");
                  }}
                >
                  Edit<span className="sr-only"> @{profile.mention}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => remove(profile)}
                >
                  Remove<span className="sr-only"> @{profile.mention}</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={save} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="mention-mention">Mention</FieldLabel>
              <Input
                id="mention-mention"
                required
                maxLength={32}
                pattern="@?[a-zA-Z0-9_]+"
                value={form.mention}
                disabled={pending || editing}
                onChange={(e) => setForm({ ...form, mention: e.target.value })}
                placeholder="buh"
              />
              <FieldDescription>
                The name after @ in existing captions. Matching ignores case.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="mention-username">MC Username</FieldLabel>
              <Input
                id="mention-username"
                required
                minLength={3}
                maxLength={16}
                pattern="[a-zA-Z0-9_]+"
                disabled={pending}
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="mention-uuid">UUID (optional)</FieldLabel>
              <Input
                id="mention-uuid"
                maxLength={36}
                disabled={pending}
                value={form.uuid}
                onChange={(e) => setForm({ ...form, uuid: e.target.value })}
              />
              <FieldDescription>
                Use a UUID to keep the skin linked if the player changes their
                name.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="mention-bio">Bio (optional)</FieldLabel>
              <Textarea
                id="mention-bio"
                maxLength={280}
                disabled={pending}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
          </FieldGroup>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            {editing && (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  setForm(empty);
                  setEditing(false);
                  setError("");
                }}
              >
                Cancel edit
              </Button>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Save mention" : "Add mention"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
