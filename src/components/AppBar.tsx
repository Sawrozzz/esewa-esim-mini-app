import { useEffect } from 'react'
import { ESewaAppBar, useESewaDataProvider } from 'esewa-ui-library'

type Props = {
  title: string
  onBack: () => void
  /** Present on the destinations screen only — opens the traveller's eSIMs. */
  actionIcon?: string
  onAction?: () => void
}

const AppBar = ({ title, onBack, actionIcon, onAction }: Props) => {
  const { updateData } = useESewaDataProvider()

  useEffect(() => {
    updateData({ title })
  }, [title])

  return (
    <div className="sticky top-0 z-30">
      <ESewaAppBar
        icon="icon-es-arrow-left"
        titleposition="left"
        onBackIconClick={onBack}
        actionIcon={actionIcon}
        onActionIconClick={onAction}
      />
    </div>
  )
}

export default AppBar
