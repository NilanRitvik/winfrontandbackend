@echo off
echo ============================================
echo      UPLOADING TO GITHUB: win365v1
echo ============================================
echo.
echo Current Remote:
git remote -v
echo.
echo Setting up Git credentials helper...
git config --global credential.helper manager
echo.
echo --------------------------------------------
echo PLEASE AUTHENTICATE IN THE POPUP WINDOW...
echo --------------------------------------------
git push -u origin main
echo.
if %errorlevel% neq 0 (
    echo.
    echo ((( PUSH FAILED )))
    echo.
    echo ERROR: 403 / Permission Denied?
    echo 1. Ensure you are signed into GitHub as 'NilanRitvik'.
    echo 2. If a window didn't pop up, you might have old credentials saved.
    echo.
) else (
    echo.
    echo >>> SUCCESS! Code uploaded. <<<
    echo.
)
pause
