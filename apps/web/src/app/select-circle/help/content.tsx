"use client";

import { HelpContent } from "@/components/shared/help-content";
import { toast } from "sonner";

interface SupportTicket {
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
}

export function SelectCircleHelpContent() {
  const handleSubmitTicket = async (ticket: SupportTicket) => {
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });

      if (!response.ok) throw new Error("Failed to submit ticket");
      
      return await response.json();
    } catch (error) {
      console.error("Error submitting ticket:", error);
      throw error;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <HelpContent
        role="select_circle"
        onSubmitTicket={handleSubmitTicket}
      />
    </div>
  );
}