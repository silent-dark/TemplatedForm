(function () {
    var thisDom = document.getElementById("comarea");

    window.homeView = function () {
        var tplForm = new TemplatedForm.Template(thisDom, {
            div: {$:{
                text:"首页模块"
            }}
        });
        tplForm.init("isreset");
    };

    window.classesView = function () {
        var tplForm = new TemplatedForm.Template(thisDom, {
            div: {$:{
                text:"班级管理模块"
            }}
        });
        tplForm.init("isreset");
    };

    window.coursesView = function () {
        var tplForm = new TemplatedForm.Template(thisDom, {
            div: {$:{
                text:"课程管理模块"
            }}
        });
        tplForm.init("isreset");
    };

    window.historyView = function () {
        var tplForm = new TemplatedForm.Template(thisDom, {
            div: {$:{
                text:"历史管理模块"
            }}
        });
        tplForm.init("isreset");
    };

    window.devicesView = function () {
        var tplForm = new TemplatedForm.Template(thisDom, {
            div: {$:{
                text:"设备管理模块"
            }}
        });
        tplForm.init("isreset");
    };
})();
