"use client";

import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { WorkspaceSelector } from "@/components/workspace/workspace-selector";
import { PlanBadge } from "@/components/plan/plan-badge";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useAuth } from "@/hooks/use-auth";
import { useWorkspaces } from "@/hooks/use-workspaces";
import {
  BarChart3,
  Calendar,
  Clock,
  FileEdit,
  HelpCircle,
  ImageIcon,
  Link2,
  LogOut,
  Plus,
  Send,
  Settings,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SidebarProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceContext();
  const { user, logout } = useAuth();
  const { workspaces, loading } = useWorkspaces();
  const pathname = usePathname();

  // Charger le workspace sauvegardé quand les workspaces sont disponibles
  useEffect(() => {
    if (!loading && workspaces.length > 0 && !selectedWorkspace) {
      const savedWorkspaceId = localStorage.getItem("selectedWorkspaceId");
      if (savedWorkspaceId) {
        const savedWorkspace = workspaces.find(
          (w) => w.id === savedWorkspaceId,
        );
        if (savedWorkspace) {
          console.log(
            "Restauration du workspace sauvegardé:",
            savedWorkspace.name,
          );
          setSelectedWorkspace(savedWorkspace);
        } else {
          // Si le workspace sauvegardé n'existe plus, le supprimer du localStorage
          localStorage.removeItem("selectedWorkspaceId");
        }
      } else if (workspaces.length > 0) {
        // Si aucun workspace n'est sauvegardé, sélectionner le premier par défaut
        console.log(
          "Sélection du premier workspace par défaut:",
          workspaces[0].name,
        );
        setSelectedWorkspace(workspaces[0]);
      }
    }
  }, [loading, workspaces, selectedWorkspace, setSelectedWorkspace]);

  const navigation = [
    {
      name: "Overview",
      items: [{ name: "Overview", href: "/dashboard", icon: BarChart3 }],
    },
    {
      name: "Posts",
      items: [
        { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
        { name: "Scheduled", href: "/dashboard/schedule", icon: Clock },
        { name: "Posted", href: "/dashboard/all-posts", icon: Send },
        { name: "Drafts", href: "/dashboard/drafts", icon: FileEdit },
      ],
    },
    {
      name: "AI Tools",
      items: [
        { name: "Watermark", href: "/dashboard/ai-tools", icon: ImageIcon },
      ],
    },
    {
      name: "Configuration",
      items: [
        { name: "Connections", href: "/dashboard/accounts", icon: Link2 },
        { name: "Workspaces", href: "/dashboard/workspaces", icon: Users },
        { name: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
    {
      name: "Support",
      items: [{ name: "Help", href: "/dashboard/help", icon: HelpCircle }],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="Luma Post Logo"
                width={32}
                height={32}
                className="object-cover"
              />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Luma Post</h1>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="p-4 border-b border-gray-200">
          <WorkspaceSelector
            selectedWorkspace={selectedWorkspace}
            onWorkspaceChange={setSelectedWorkspace}
            onCreateWorkspace={() => setShowCreateDialog(true)}
            workspaces={workspaces}
            loading={loading}
          />
        </div>

        {/* Create Post Button */}
        <div className="p-4">
          <Link href="/dashboard/create-post">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Create post
            </button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.name}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.name}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          pathname === item.href
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.displayName || "Utilisateur"}
                </p>
                <div className="mt-1">
                  <PlanBadge size="sm" showUpgradeLink={false} />
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>

      {/* Create Workspace Dialog */}
      <CreateWorkspaceDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </div>
  );
}
