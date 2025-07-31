"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"
import { pokemonTheme } from "@/lib/pokemon-theme"

interface ReleaseConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pokemonName: string
  isReleasing: boolean
}

export function ReleaseConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  pokemonName,
  isReleasing,
}: ReleaseConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white border-4 border-red-800 rounded-lg shadow-2xl p-6">
        <DialogHeader className="text-center">
          <DialogTitle
            className={`${pokemonTheme.typography.heading} text-red-700 text-2xl mb-2 flex items-center justify-center gap-2`}
          >
            <Trash2 className="w-6 h-6" />
            Confirmar Liberación
          </DialogTitle>
          <DialogDescription className="text-gray-700 text-base">
            ¿Estás seguro de que quieres liberar a{" "}
            <span className="font-bold capitalize text-red-600">{pokemonName}</span>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-6">
          <Button
            onClick={onClose}
            disabled={isReleasing}
            className={`
              ${pokemonTheme.typography.button}
              bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 border-blue-800 text-white
              shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95
            `}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isReleasing}
            className={`
              ${pokemonTheme.typography.button}
              bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-900 text-white
              shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95
              ${isReleasing ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {isReleasing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Liberando...
              </>
            ) : (
              "Liberar Pokémon"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
