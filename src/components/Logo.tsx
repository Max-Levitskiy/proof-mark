import { useNavigate } from 'react-router-dom'
import logoSvg from '@/assets/logo.svg'

export function Logo() {
  const navigate = useNavigate()

  return (
    <img
      src={logoSvg}
      alt="ProofMark"
      className="h-[25px] w-[119px] cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => navigate('/')}
    />
  )
}
