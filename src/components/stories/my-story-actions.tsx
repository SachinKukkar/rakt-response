"use client";

import { useActionState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage, SubmitButton } from "@/components/common/form-parts";
import { initialActionState } from "@/lib/action-result";
import { requestStoryCorrection, updateStoryConsents, withdrawStory } from "@/actions/stories";

export function StoryConsentForm({
  storyId,
  showName,
  showPhoto,
  showPersonal,
  contact,
  hasPhoto,
}: {
  storyId: string;
  showName: boolean;
  showPhoto: boolean;
  showPersonal: boolean;
  contact: boolean;
  hasPhoto: boolean;
}) {
  const [state, action] = useActionState(updateStoryConsents, initialActionState);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="story_id" value={storyId} />
      <fieldset className="space-y-2 text-sm">
        <legend className="mb-1 font-semibold text-navy">What may be shown</legend>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="show_name" defaultChecked={showName} className="size-5 accent-primary" /> My display name
        </label>
        {hasPhoto ? (
          <label className="flex min-h-11 items-center gap-3">
            <input type="checkbox" name="show_photo" defaultChecked={showPhoto} className="size-5 accent-primary" /> My photo
          </label>
        ) : null}
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="show_personal" defaultChecked={showPersonal} className="size-5 accent-primary" /> My blood group
        </label>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="contact" defaultChecked={contact} className="size-5 accent-primary" /> Reviewers may contact me
        </label>
      </fieldset>
      <FormMessage state={state} />
      <SubmitButton size="sm" variant="outline">
        Save choices
      </SubmitButton>
    </form>
  );
}

export function StoryCorrectionForm({ storyId }: { storyId: string }) {
  const [state, action] = useActionState(requestStoryCorrection, initialActionState);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="story_id" value={storyId} />
      <label htmlFor={`corr-${storyId}`} className="text-sm font-semibold text-navy">
        Request a correction
      </label>
      <Textarea id={`corr-${storyId}`} name="details" rows={3} placeholder="What should be changed?" required />
      <FormMessage state={state} />
      <SubmitButton size="sm" variant="outline" pendingText="Sending…">
        Send correction request
      </SubmitButton>
    </form>
  );
}

export function StoryWithdrawForm({ storyId }: { storyId: string }) {
  const [state, action] = useActionState(withdrawStory, initialActionState);
  if (state.ok) return <FormMessage state={state} />;
  return (
    <form
      action={action}
      className="space-y-2"
      onSubmit={(e) => {
        if (!window.confirm("Withdraw this story? It will be removed from the website immediately.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="story_id" value={storyId} />
      <label htmlFor={`wd-${storyId}`} className="text-sm font-semibold text-navy">
        Withdraw this story
      </label>
      <Textarea id={`wd-${storyId}`} name="reason" rows={2} placeholder="Reason (optional)" />
      <FormMessage state={state} />
      <SubmitButton size="sm" variant="destructive" pendingText="Withdrawing…">
        Withdraw story
      </SubmitButton>
    </form>
  );
}
