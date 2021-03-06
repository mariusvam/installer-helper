try {
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var sh = WScript.CreateObject("WScript.Shell");
    var lib = eval(fs.OpenTextFile(
            sh.ExpandEnvironmentStrings("%NIH%") + "\\Lib.js", 1).ReadAll());
    lib.installerHelper = sh.ExpandEnvironmentStrings("%NIH%");

    var installer = WScript.CreateObject("WindowsInstaller.Installer");
    var before_ = installer.Products;
    var before = [];
    for (var i = 0; i < before_.Count; i++) {
        before.push(before_.Item(i));
    }

    var r = lib.exec(lib.findFile(".", /\.exe$/i) + " /quiet InstallAllUsers=1 \"TargetDir=" + sh.currentDirectory + "\"");
    if (r[0] !== 0) 
        throw new Error("Installation failed");

    var after_ = installer.Products;
    var after = [];
    for (var i = 0; i < after_.Count; i++) {
        after.push(after_.Item(i));
    }
    var diff = lib.subArrays(after, before);
    WScript.Echo("Difference: " + before.length + " " + after.length + " " + diff[0]);
    var ts = fs.CreateTextFile(".Npackd\\Uninstall.bat", true, false);
    for (var i = 0; i< diff.length; i++) {
        ts.WriteLine("call \"%nih%\\UninstallMSI.bat\" " +  diff[i]);
        ts.WriteLine("if %errorlevel% neq 0 exit /b 1");
    }
    ts.Close();
} catch (e) {
    WScript.Echo(e.name + ": " + e.message);
    WScript.Echo(e.number + ": " + e.description);
    WScript.Quit(1);
}
