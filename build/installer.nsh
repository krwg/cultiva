!macro customHeader
  BrandingText "Cultiva ${VERSION} · Rowan"
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Welcome to Cultiva"
  !define MUI_WELCOMEPAGE_TEXT "Grow your habits. Grow yourself.$\r$\n$\r$\nOffline-first habit tracker — no cloud, no account required."
  !insertmacro MUI_PAGE_WELCOME
!macroend

!macro customFinishPage
  !define MUI_FINISHPAGE_TITLE "Cultiva is ready"
  !define MUI_FINISHPAGE_TEXT "Your garden awaits. Plant a habit and watch it grow."
  !define MUI_FINISHPAGE_RUN
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Cultiva"
  !insertmacro MUI_PAGE_FINISH
!macroend
