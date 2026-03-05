import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Github, ExternalLink, ShieldCheck } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ isOpen, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="bg-blue-900 p-4 rounded-3xl shadow-xl shadow-blue-900/20 mb-4 inline-flex">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <DialogTitle className="text-2xl font-black text-blue-900 tracking-tighter">
            SEGECS
          </DialogTitle>
          <DialogDescription className="text-gray-500 font-medium text-center">
            Sistema Escolar de Gestão do Estágio Curricular Supervisionado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3 text-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Desenvolvedores
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <a
                href="https://github.com/prof-raimundo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Github size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                      Prof. Raimundo Nonato de Sousa
                    </p>
                    <p className="text-[10px] font-bold text-blue-600">
                      @prof-raimundo
                    </p>
                  </div>
                </div>
                <ExternalLink
                  size={16}
                  className="text-gray-300 group-hover:text-blue-600"
                />
              </a>

              <a
                href="https://github.com/emanuellcs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Github size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">
                      Emanuel Lázaro
                    </p>
                    <p className="text-[10px] font-bold text-blue-600">
                      @emanuellcs
                    </p>
                  </div>
                </div>
                <ExternalLink
                  size={16}
                  className="text-gray-300 group-hover:text-blue-600"
                />
              </a>
            </div>
          </div>

          <div className="space-y-3 text-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Repositório do Projeto
            </h4>
            <a
              href="https://github.com/prof-raimundo/segecs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-6 bg-blue-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-800 transition-all active:scale-95 shadow-lg shadow-blue-900/20"
            >
              <Github size={16} /> Ver Código Fonte no GitHub
            </a>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} SEGECS v0.1.0
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
