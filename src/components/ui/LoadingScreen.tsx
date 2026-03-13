import { useTranslation } from "react-i18next";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  const { t } = useTranslation();
  const displayMessage = message || t("common.loading");

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-blue-900 font-black text-sm uppercase tracking-[0.2em] animate-pulse">
            {displayMessage}
          </p>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            {t("common.waitAMoment", "Wait a moment")}
          </p>
        </div>
      </div>
    </div>
  );
}
