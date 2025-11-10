"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface TikTokConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
  isConnecting?: boolean;
}

export default function TikTokConnectionModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting = false,
}: TikTokConnectionModalProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Connect TikTok
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-6">
          {/* Description */}
          <p className="text-gray-600 text-sm">
            Connect a TikTok Creator or Business profile to schedule posts,
            manage comments and more.
          </p>

          {/* Requirements */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Requirements:</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Must be a Business or Creator profile
                </span>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  Account must be older than 48 hours
                </span>
              </div>
            </div>
          </div>

          {/* Expandable Sections */}
          <div className="space-y-3">
            {/* Login Instructions */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("login")}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">
                  Login to the account you want to connect
                </span>
                <div
                  className={`transform transition-transform ${
                    expandedSection === "login" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </div>
              </button>
              {expandedSection === "login" && (
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="text-sm text-gray-700 space-y-3">
                    <p className="font-medium text-gray-900">
                      TikTok does not support logging in to multiple accounts at
                      once on web. To connect multiple accounts to LumaPost, you
                      will need to:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        Login to the account you wish to connect to LumaPost (on
                        this device, in the same browser)
                      </li>
                      <li>Press the Connect button below</li>
                      <li>Connect</li>
                      <li>
                        Logout and then Login to the other account you wish to
                        connect
                      </li>
                      <li>Connect</li>
                      <li>
                        Repeat until you have all your accounts connected to
                        LumaPost
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>

            {/* Warm up Instructions */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection("warmup")}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">
                  Warm up account before posting
                </span>
                <div
                  className={`transform transition-transform ${
                    expandedSection === "warmup" ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </div>
              </button>
              {expandedSection === "warmup" && (
                <div className="p-4 bg-white border-t border-gray-100">
                  <div className="text-sm text-gray-700 space-y-3">
                    <p className="font-medium text-amber-600">
                      TikTok is strict about new accounts posting. To avoid
                      getting your account restricted:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 ml-4">
                      <li>
                        Use the account like a human for the first 48 hours of a
                        new account
                      </li>
                      <li>
                        Follow and interact with your target audience, this is
                        how TikTok decides who to show your content to
                      </li>
                      <li>
                        Avoid posting in the first 48 hours of a new account
                      </li>
                      <li>
                        Do no post the same content to multiple TikTok accounts
                        (cross-platform is fine)
                      </li>
                      <li>
                        Growing accounts:{" "}
                        <a href="#" className="text-green-600 hover:underline">
                          Read more information here
                        </a>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConnect}
              disabled={isConnecting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </div>
              ) : (
                "Connect"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
