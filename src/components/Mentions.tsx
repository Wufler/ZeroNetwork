"use client";

import { createContext, useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export const ProfilesContext = createContext<Profile[]>([]);

function Mention({ name }: { name: string }) {
  const profiles = useContext(ProfilesContext);
  const profile = profiles.find(
    (entry) => entry.mention === name.toLowerCase(),
  );
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={200}
        closeDelay={150}
        aria-label={`Profile for @${name}`}
        className="inline cursor-pointer rounded-sm font-inherit underline decoration-current/40 decoration-dotted underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-ring"
      >
        @{name}
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={8}
        className="max-w-[calc(100vw-2rem)] p-4 motion-reduce:animate-none"
      >
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            {profile && (
              <AvatarImage
                src={`https://mc-heads.net/avatar/${profile.uuid || profile.username}/80`}
                alt={`${profile.username}`}
              />
            )}
            <AvatarFallback>
              {(profile?.username || name).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <PopoverTitle>{profile?.username || `@${name}`}</PopoverTitle>
            {profile?.bio && (
              <PopoverDescription className="whitespace-pre-wrap wrap-anywhere">
                {profile.bio}
              </PopoverDescription>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function Mentions({ text }: { text: string }) {
  // Exclude email addresses and match the entire handle, including legacy aliases.
  return text
    .split(/((?<![\w@])@[a-zA-Z0-9_]+\b)/g)
    .map((part, index) =>
      /^@[a-zA-Z0-9_]+$/.test(part) ? (
        <Mention key={`${index}-${part}`} name={part.slice(1)} />
      ) : (
        part
      ),
    );
}
