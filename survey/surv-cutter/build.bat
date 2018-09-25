pushd ..
electron-packager surv-cutter --platform=win32 --arch=x64 --overwrite --out=%userprofile%\Desktop --ignore="(\.history|\.vscode)"
popd
