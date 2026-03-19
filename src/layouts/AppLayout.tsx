import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Menu, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  // Closes mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevents body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.refetchQueries();
      toast.success(
        t("layout.syncSuccess", "Data synchronized with database!"),
      );
    } catch (error) {
      toast.error(t("layout.syncError", "Error synchronizing data."));
      console.error(error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const sidebarTransition = {
    type: "spring",
    damping: 25,
    stiffness: 200,
  } as const;

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-slate-900 overflow-x-hidden">
      {/* Desktop Sidebar - Fixed Animated Container */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={sidebarTransition}
        className="hidden lg:block fixed inset-y-0 left-0 z-40"
      >
        <Sidebar isCollapsed={isSidebarCollapsed} />
      </motion.div>

      {/* Desktop Spacer - Moves main content in sync */}
      <motion.div
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={sidebarTransition}
        className="hidden lg:block shrink-0"
      />

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden"
            >
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t("layout.openMenu", "Open menu")}
            >
              <Menu size={24} />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
              title={
                isSidebarCollapsed
                  ? t("layout.expandMenu", "Expand menu")
                  : t("layout.collapseMenu", "Collapse menu")
              }
            >
              {isSidebarCollapsed ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronLeft size={20} />
              )}
            </button>

            {/* Central Title/Header */}
            <Link
              to="/dashboard"
              className="flex flex-col group transition-transform active:scale-95"
            >
              <h1 className="text-xl font-bold tracking-tight text-blue-900 leading-none group-hover:text-blue-700 transition-colors">
                SEGECS
              </h1>
              <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider mt-0.5">
                {t("layout.systemTitle", "Internship Management System")}
              </p>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm",
                isRefreshing
                  ? "bg-blue-50 text-blue-400 border-blue-100"
                  : "bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95",
              )}
              title={t("layout.syncDatabase", "Sync with Database")}
            >
              <RefreshCcw
                size={14}
                className={isRefreshing ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline uppercase tracking-wide text-[10px]">
                {t("common.sync", "Sync")}
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar">
          <div className="container mx-auto p-4 md:p-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
