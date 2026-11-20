import { Heart, MessageCircleHeart } from 'lucide-react'
import { APP_TITLE, APP_DESC, PERSON_NAMES } from '../App'

export default function Header({ messageCount }) {
  const namesStr = PERSON_NAMES.slice(0, -1).join(', ') + ' & ' + PERSON_NAMES.at(-1)

  return (
    <header className="pt-8 pb-4 px-4 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Heart className="w-5 h-5 text-wine fill-wine/20" />
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-wine leading-tight">
          {APP_TITLE}
        </h1>
        <Heart className="w-5 h-5 text-wine fill-wine/20" />
      </div>

      <p className="text-sm text-charcoal/60 max-w-sm mx-auto leading-relaxed">
        {APP_DESC}{' '}
        <strong className="text-wine/80">{namesStr}</strong> nhé 💌
      </p>

      <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-dusty font-medium">
        <MessageCircleHeart className="w-4 h-4" />
        <span>{messageCount} lời nhắn đã nhận</span>
      </div>
    </header>
  )
}
