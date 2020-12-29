"ui";
var color = "#009688";
//开始时间，提前时间量，提交频率，结束时间，网络时间偏移，网络接口延迟，设备延迟，辅助提交，倒计时浮窗x，倒计时浮窗y
var startTime, forwardTime, interval, lastTime, NTPClockOffset, NTPClockDelay, deviceDelay, autoSubmit, xp, yp;
//自动购买，自动确认，自动结算，自动提交，自动支付，校验价格，最大价格，使用网络时间
var autoBuy, autoConfirm, autoCart, autoSubmit, autoPay, checkSku, needConfirm, checkPrice, maxPrice, isUseNetTime;
//捡漏，频率
var jlModel, jlhz;
//商品名称，购买按钮
var itemName, buyName, color, size, other, volume, type, skuNum = 0, skuDelay;



//倒计时浮窗
var window;
//定时任务
var workId;
//存储
var storage = storages.create("tb.js");
//时间工具类
var timeUtils = require('TimeUtils.js');

var myQueue = new ArrayQueue();

importClass(android.view.View);

//主页面
ui.layout(
    <drawer id="drawer">
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="橱窗、收藏页模式" />
                <tabs id="tabs" />
            </appbar>

            <viewpager id="viewpager">
                <frame>
                    <ScrollView>
                        <vertical w="*" h="auto" margin="6" >
                            <text h="30" id="networkTest" text="正在检测网络延迟..." gravity="top|left" textColor="red" textSize="13sp" margin="0 5" />
                            <horizontal>
                                <checkbox id="isUseNetTime" text="使用网络时间" textColor="black" checked="true" />
                                <checkbox id="autoPay" text="自动支付" checked="true" />
                            </horizontal>
                            <horizontal>
                                <checkbox id="needConfirm" text="需要确认" checked="true" />
                                <checkbox id="checkSku" text="SKU延时：" checked="true" />
                                <input id="skuDelay" text="120" hint="120" marginBottom="-6" />
                            </horizontal>
                            <horizontal>
                                <checkbox id="jlModel" text="重试频率：" textColor="black" checked="true" />
                                <input id="jlhz" text="1500" hint="频率" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <checkbox id="checkPrice" text="最高价格：" textColor="black" />
                                <input id="maxPrice" text="" hint="10" marginBottom="-6" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <checkbox id="baseTime" text="倒计时    " textColor="black" />
                                <text h="30" text="X：" gravity="top|left" textColor="black" />
                                <input id="xp" text="360" hint="360" marginBottom="-6" />
                                <text h="30" text=" , Y：" gravity="top|left" textColor="black" />
                                <input id="yp" text="1250" hint="1250" marginBottom="-6" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <text h="30" text="商品关键字：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="itemName" text="" hint="袋鼠医用" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <text h="30" text="购买关键字：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="buyName" text="" hint="立即购买、领劵购买、马上抢" marginBottom="-6" />
                            </horizontal>
                            <vertical id="skuShow" >
                                <horizontal >
                                    <text h="30" text="颜色：" gravity="top|left" textColor="black" textSize="16" />
                                    <input id="color" text="" hint="颜色|颜色分类|机身颜色" marginBottom="-6" textSize="16" />
                                </horizontal>
                                <horizontal >
                                    <text h="30" text="尺码：" gravity="top|left" textColor="black" textSize="16" />
                                    <input id="size" text="" hint="尺码|鞋码|机身尺码" marginBottom="-6" textSize="16" />
                                </horizontal>
                                <horizontal >
                                    <text h="30" text="容量：" gravity="top|left" textColor="black" textSize="16" />
                                    <input id="volume" text="" hint="存储容量|化妆品净含量" marginBottom="-6" textSize="16" />
                                </horizontal>
                                <horizontal >
                                    <text h="30" text="类型：" gravity="top|left" textColor="black" textSize="16" />
                                    <input id="type" text="" hint="网络类型" marginBottom="-6" textSize="16" />
                                </horizontal>
                                <horizontal >
                                    <text h="30" text="其他：" gravity="top|left" textColor="black" textSize="16" />
                                    <input id="other" text="" hint="口味|套餐类型" marginBottom="-6" textSize="16" />
                                </horizontal>
                            </vertical>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <horizontal >
                                <text h="30" text="开始时间(年/月/日 时:分:秒)：" gravity="top|left" textColor="black" textSize="16" />
                            </horizontal>
                            <horizontal >
                                <input id="startTime" text="2020/03/03 14:30:00" hint="无" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <text h="30" text="提前开始时间(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="forwardTime" text="500" hint="无" marginBottom="-6" />
                            </horizontal >
                            <horizontal >
                                <text h="30" text="设备启动延迟抵扣量(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="deviceDelay" text="80" hint="无" marginBottom="-6" />
                            </horizontal >
                            <horizontal >
                                <text h="30" text="提交频率(毫秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="interval" text="5" hint="无" marginBottom="-6" />
                            </horizontal>
                            <horizontal >
                                <text h="30" text="抢购持续时间(秒)：" gravity="top|left" textColor="black" textSize="16" />
                                <input id="lastTime" text="5" hint="无" marginBottom="-6" />
                            </horizontal>
                            <frame w="*" margin="12" h="1" bg="#e3e3e3" />
                            <button id="checkFastSku" style="Widget.AppCompat.Button.Colored" text="测试SKU选择" />
                            <button id="runButton" style="Widget.AppCompat.Button.Colored" text="开始运行" />
                            <button id="stopUi" style="Widget.AppCompat.Button.Colored" text="退出" />
                        </vertical>
                    </ScrollView>
                </frame>
            </viewpager>
        </vertical>
    </drawer>
);

//*********************************************************页面交互********************************************************************** */
//显示倒计时浮窗
ui.baseTime.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked) {
        timeThread = threads.start(function () {
            var clockOffset = 0;
            if (ui.isUseNetTime.isChecked()) {
                clockOffset = NTPClockOffset;
                // log("================" + NTPClockOffset)
            }
            window = timeUtils.countDownTimeShow(ui.xp.text(), ui.yp.text(), ui.startTime.text(), ui.forwardTime.text(), clockOffset);
        });
    } else if (window) {
        window.close();
        // floaty.closeAll()
        timeThread.interrupt();
    }
});


//检查价格设置
ui.checkPrice.on("check", function (checked) {
    // 用户勾选价格校验
    if (checked) {
        // exectuion = engines.execScriptFile("time.js");
        if (!ui.maxPrice.text()) {
            ui.checkPrice.checked = false;
            alert("警告", "限制金额的最高金额必须填写！！！");
        }
    }
});

//自动支付设置
ui.autoPay.on("check", function (checked) {
    if (checked) {
        alert("警告", "自动支付仅限于开启了免密支付的设备，脚本会自动点击立即付款，慎用，风险自担！为了您的财产安全，请不要随意透露支付密码！！！");
    }
});

//sku配置
ui.checkSku.on("check", function (checked) {
    if (checked) {
        //     View.GONE //完全隐藏控件
        // View.INVISIBLE //隐藏控件,但保留控件的位置
        // View.VISIBLE //默认属性, 显示控件
        //隐藏
        ui.skuShow.setVisibility(View.VISIBLE);
        alert("警告", "需要自动勾选SKU属性的才需要勾选此项，延时为选中SKU后点击确认的时间。");
    } else {
        ui.skuShow.setVisibility(View.GONE);
    }
});

//确认
ui.needConfirm.on("check", function (checked) {
    if (checked) {
        alert("警告", "开启点击后买后自动确认。");
    } else {
        alert("警告", "关闭自动确认，请确认点击购买后能直接进入订单页。");
    }
});

//重试
ui.jlModel.on("check", function (checked) {
    if (checked) {
        alert("警告", "不能购买将返回活动页重新进入。");
    } else {
        alert("警告", "关闭重试，若商品不能购买将不会返回重试。");
    }
});

activity.setSupportActionBar(ui.toolbar);

//创建选项菜单(右上角)
ui.emitter.on("create_options_menu", menu => {
    menu.add("说明");
});
//监听选项菜单点击
ui.emitter.on("options_item_selected", (e, item) => {
    switch (item.getTitle()) {
        case "说明":
            alert("说明", "橱窗、收藏页面商品定时抢购模式，开启定时任务，前往商品活动页面或商品收藏页面，等待定时抢购，注意浮窗不要遮挡商品位置。"
                + "启用校验最高价格，高于价格不提交订单。测试的时候可以将价格设低，测试流程就不会提交订单，比较友好。"
                + "SKU确认测试方法为：填写SKU属性，点击“测试SKU选择”，按照提示进入要抢购的商品详情页，根据检测结果调整参数。");
            break;
    }
    e.consumed = true;
});

//退出脚本时 结束所有脚本
events.on('exit', function () {
    // engines.stopAllAndToast()
    // engines.stopAll();
    exit();
});

//启动
ui.stopUi.on("click", () => {
    //程序开始运行之前判断无障碍服务
    // toast("退出");
    // storage.clear();
    ui.finish();
});

//校验时间
ui.networkTest.on("click", () => {
    threads.start(function () {
        //重置时间
        threads.start(NTP.sync);
        //刷新延迟
        setTimeout(reflushNetTime, 500);
    });
});

//*******************************************************************页面交互***************************************************************************************** */
//*******************************************************************基础方法***************************************************************************************** */
//打开浮窗
function openConsole() {
    auto.waitFor()
    //显示控制台
    var middle = device.width / 2 - 400;
    console.setSize(800, 800);
    console.setPosition(middle, 0);
    console.show();
}

// 时间戳转时间字符串
function add0(m) {
    return m < 10 ? '0' + m : m
}

function add00(m) {
    if (m < 10) {
        return '00' + m;
    } else if (m < 100) {
        return '0' + m;
    } else {
        return m;
    }
}

function formatDate(needTime) {
    //needTime是整数，否则要parseInt转换
    var time = new Date(parseInt(needTime));
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    var ms = time.getMilliseconds();
    return add0(h) + ':' + add0(mm) + ':' + add0(s) + ":" + add00(ms);
}

// 根据时间偏移值计算真实时间
function getNow() {
    var now = new Date().getTime();
    if (isUseNetTime) {
        return now - NTPClockOffset;
    }
    return now;
}

// 检测时间字符串是否有效
function strDateTime(str) {
    var reg = /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
    var r = str.match(reg);
    if (r == null) return false;
    var d = new Date(r[1], r[3] - 1, r[4], r[5], r[6], r[7]);
    return (d.getFullYear() == r[1] && (d.getMonth() + 1) == r[3] && d.getDate() == r[4] && d.getHours() == r[5] && d.getMinutes() == r[6] && d.getSeconds() == r[7]);
}

// 获取默认开始时间
function getTime() {
    var fmt = "YYYY-MM-dd hh:mm:ss";
    var d = new Date();
    var hh = d.getHours();
    var mm = d.getMinutes();
    if (mm < 30) {
        mm = 30
    } else {
        hh += 1;
        mm = 0
    }
    var o = {
        "Y+": d.getYear() + 1900,
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "h+": hh,
        // "m+": d.getMinutes(),
        // "s+": d.getSeconds()
        "m+": mm,
        "s+": 0
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 4) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    fmt = fmt.replace(/-/g, '/');
    return fmt;
}

//*******************************************************************基础方法***************************************************************************************** */
//*******************************************************************滑动方法***************************************************************************************** */
/**
 * 下拉滑动
 * @param {*} duration  不能小于350ms
 */
function dropDown(duration) {
    var width = device.width;
    var height = device.height;
    var y1 = height / 2;
    var y2 = height * 3 / 4;
    var x1 = width / 2;
    var x2 = width / 2;
    // log(x1+"|"+y1+"|"+x2+"|"+y2)
    logInfo("刷新:" + swipe(x1, y1, x2, y2, duration))
}
/**
 * 真人模拟滑动函数
 * 
 * 传入值：起点终点坐标
 * 效果：模拟真人滑动
 */
function randomSwipe(sx, sy, ex, ey) {
    //设置随机滑动时长范围
    var timeMin = 1000
    var timeMax = 3000
    //设置控制点极限距离
    var leaveHeightLength = 500

    //根据偏差距离，应用不同的随机方式
    if (Math.abs(ex - sx) > Math.abs(ey - sy)) {
        var my = (sy + ey) / 2
        var y2 = my + random(0, leaveHeightLength)
        var y3 = my - random(0, leaveHeightLength)

        var lx = (sx - ex) / 3
        if (lx < 0) { lx = -lx }
        var x2 = sx + lx / 2 + random(0, lx)
        var x3 = sx + lx + lx / 2 + random(0, lx)
    } else {
        var mx = (sx + ex) / 2
        var y2 = mx + random(0, leaveHeightLength)
        var y3 = mx - random(0, leaveHeightLength)

        var ly = (sy - ey) / 3
        if (ly < 0) { ly = -ly }
        var y2 = sy + ly / 2 + random(0, ly)
        var y3 = sy + ly + ly / 2 + random(0, ly)
    }

    //获取运行轨迹，及参数
    var time = [0, random(timeMin, timeMax)]
    var track = bezierCreate(sx, sy, x2, y2, x3, y3, ex, ey)

    // log("随机控制点A坐标：" + x2 + "," + y2)
    // log("随机控制点B坐标：" + x3 + "," + y3)
    // log("随机滑动时长：" + time[1])

    // log("time:"+time)
    // log("track:"+track)
    //滑动
    gestures(time.concat(track))
}


function bezierCreate(x1, y1, x2, y2, x3, y3, x4, y4) {
    //构建参数
    var h = 100;
    var cp = [{ x: x1, y: y1 + h }, { x: x2, y: y2 + h }, { x: x3, y: y3 + h }, { x: x4, y: y4 + h }];
    var numberOfPoints = 100;
    var curve = [];
    var dt = 1.0 / (numberOfPoints - 1);

    //计算轨迹
    for (var i = 0; i < numberOfPoints; i++) {
        var ax, bx, cx;
        var ay, by, cy;
        var tSquared, tCubed;
        var result_x, result_y;

        cx = 3.0 * (cp[1].x - cp[0].x);
        bx = 3.0 * (cp[2].x - cp[1].x) - cx;
        ax = cp[3].x - cp[0].x - cx - bx;
        cy = 3.0 * (cp[1].y - cp[0].y);
        by = 3.0 * (cp[2].y - cp[1].y) - cy;
        ay = cp[3].y - cp[0].y - cy - by;

        var t = dt * i
        tSquared = t * t;
        tCubed = tSquared * t;
        result_x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
        result_y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
        curve[i] = {
            x: result_x,
            y: result_y
        };
    }

    //轨迹转路数组
    var array = [];
    for (var i = 0; i < curve.length; i++) {
        try {
            var j = (i < 100) ? i : (199 - i);
            xx = parseInt(curve[j].x)
            yy = parseInt(Math.abs(100 - curve[j].y))
        } catch (e) {
            break
        }
        array.push([xx, yy])
    }

    return array
}
//*******************************************************************滑动方法***************************************************************************************** */
//*******************************************************************日志处理***************************************************************************************** */
// 获取时分秒用于记录日志
function logCommon(msg) {
    console.log(formatDate(getNow()) + " " + msg);
}
function logInfo(msg) {
    console.info(formatDate(getNow()) + " " + msg);
}
function logWarn(msg) {
    console.warn(formatDate(getNow()) + " " + msg);
}
function logError(msg) {
    console.error(formatDate(getNow()) + " " + msg);
}

//*******************************************************************日志处理***************************************************************************************** */
//*******************************************************************网络时间***************************************************************************************** */

// 检测网络延迟和时间偏差
var NTP = {
    requiredResponses: 3,
    serverTimes: [],
    serverDelay: [],
    serverUrl: "http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp",
    resyncTime: 0, // minutes
    sync: function () {
        var offset = storage.get("NTPClockOffset");
        if (offset) {
            try {
                var t = offset.split("|")[1];
                var d = NTP.fixTime() - parseInt(t, 10);
                if (d < (1000 * 60 * NTP.resyncTime)) {
                    return false;
                }
            } catch (e) {
            }
        }
        NTP.getServerTime();
    },
    getNow: function () {
        var date = new Date();
        return date.getTime();
    },
    parseServerResponse: function (data) {
        var NtpStartTime = storage.get("NtpStartTime");
        var NtpStopTime = NTP.getNow();
        var origtime = parseInt(data.data.t);
        var delay = ((NtpStopTime - NtpStartTime) / 2);
        var offset = NtpStopTime - origtime - delay;
        NTP.serverTimes.push(offset);
        NTP.serverDelay.push(delay);

        // 因为网络问题，需要多次获取偏移值，获取平均值
        if (NTP.serverTimes.length >= NTP.requiredResponses) {
            var sumOffset = 0;
            var sumDelay = 0;
            var i = 0;
            for (i = 0; i < NTP.serverTimes.length; i++) {
                sumOffset += NTP.serverTimes[i];
                sumDelay += NTP.serverDelay[i];
            }
            var averageOffset = Math.round(sumOffset / i);
            var averageDelay = Math.round(sumDelay / i);
            storage.put("NTPClockOffset", averageOffset + '|' + NTP.fixTime()); // 保存获得offset时的时间戳
            storage.put("NTPClockDelay", averageDelay); // 保存获得offset时的时间戳
        } else {
            NTP.getServerTime();
        }
    },
    getServerTime: function () {
        var NtpStartTime = NTP.getNow();
        storage.put("NtpStartTime", NtpStartTime);

        var res = http.get(NTP.serverUrl);
        if (res.statusCode !== 200) {
            toast("获取网络时间失败: " + res.statusCode + " " + res.statusMessage);
            return false;
        } else {
            NTP.parseServerResponse(res.body.json());
        }
    },
    fixTime: function (timeStamp) {
        if (!timeStamp) {
            timeStamp = NTP.getNow();
        }
        var offset = storage.get("NTPClockOffset");
        try {
            if (!offset) {
                offset = 0;
            } else {
                offset = offset.split("|")[0];
            }
            if (isNaN(parseInt(offset, 10))) {
                return timeStamp;
            }
            return timeStamp + parseInt(offset, 10);
        } catch (e) {
            return timeStamp;
        }
    }
};

function reflushNetTime() {
    NTPClockOffset = storage.get("NTPClockOffset", "0");
    NTPClockDelay = storage.get("NTPClockDelay", "0");
    if (!NTPClockOffset) {
        NTPClockOffset = 0;
    } else {
        NTPClockOffset = parseInt(NTPClockOffset.split("|")[0]);
    }
    if (NTPClockOffset < 0) {
        var offset_str = "慢了" + -NTPClockOffset + 'ms，'
    } else {
        offset_str = "快了" + NTPClockOffset + 'ms，'
    }
    //网络延迟数据显示
    ui.networkTest.setText("当前设备时间比平台" + offset_str + "网络延迟：" + NTPClockDelay + "ms");
}
//*******************************************************************网络时间***************************************************************************************** */
//*******************************************************************初始化设置***************************************************************************************** */
function initConfig() {
    //刷新延迟
    reflushNetTime();

    //商品名称
    ui.itemName.setText(storage.get("itemName", "").toString());
    //购买关键字
    ui.buyName.setText(storage.get("buyName", "购买").toString());

    ui.autoPay.checked = storage.get("autoPay", false);

    //确认sku
    ui.checkSku.checked = storage.get("checkSku", false);
    ui.skuDelay.setText(storage.get("skuDelay", "120").toString());

    ui.needConfirm.checked = storage.get("needConfirm", true);

    if (ui.checkSku.checked) {
        //     View.GONE //完全隐藏控件
        // View.INVISIBLE //隐藏控件,但保留控件的位置
        // View.VISIBLE //默认属性, 显示控件
        //隐藏
        ui.skuShow.setVisibility(View.VISIBLE);
    } else {
        ui.skuShow.setVisibility(View.GONE);
    }

    //捡漏
    ui.jlModel.checked = storage.get("jlModel", false);
    //捡漏频率
    ui.jlhz.setText(storage.get("jlhz", "100").toString());

    //开启时间
    ui.startTime.setText(getTime());

    //校验价格
    ui.checkPrice.checked = false;
    //最高价格
    ui.maxPrice.setText("1");

    //是否适用网络时间
    ui.isUseNetTime.checked = storage.get("isUseNetTime", true);
    //提前时间
    ui.forwardTime.setText(storage.get("forwardTime", "100").toString());
    //设备启动延迟抵扣量
    ui.deviceDelay.setText(storage.get("deviceDelay", "0").toString());

    //提交频率
    ui.interval.setText(storage.get("interval", "100").toString());
    //持续时间
    ui.lastTime.setText(storage.get("lastTime", "5").toString());
    ui.xp.setText(storage.get("xp", "360").toString());
    ui.yp.setText(storage.get("yp", "250").toString());
}
//*******************************************************************初始化设置***************************************************************************************** */
//*******************************************************************主程序***************************************************************************************** */

// 初始化用户配置
//获取网络时间
threads.start(NTP.sync);
//初始化数据
setTimeout(initConfig, 500);


//*******************************************************************主程序***************************************************************************************** */
//*******************************************************************主程序***************************************************************************************** */
//检查急速模式
ui.checkFastSku.on("click", () => {
    if (ui.checkFastSku.text() == "测试SKU选择") {
        ui.checkFastSku.text("停止测试");
        skuNum = 0;
        logInfo("开始测试SKU选择");
        //保持屏幕常亮
        device.keepScreenOn();
        //开启控制台
        threads.start(openConsole);
        //开始任务
        threads.start(doCheckFastJob);
        ui.checkFastSku.text("停止测试");
    } else {
        ui.checkFastSku.text("测试SKU选择");
        logError("停止测试");
        skuNum = 0;
        threads.start(function () {
            console.hide();
            device.cancelKeepingAwake();
            threads.shutDownAll();
        });
    }
});

//开始
ui.runButton.on("click", () => {

    //准备参数

    //自动支付
    autoPay = ui.autoPay.checked;

    //捡漏模式
    jlModel = ui.jlModel.checked;
    //捡漏频率 毫秒
    jlhz = ui.jlhz.text();

    //是否需要确认sku
    checkSku = ui.checkSku.checked;
    skuDelay = parseInt(ui.skuDelay.getText());

    needConfirm = ui.needConfirm.checked;

    //sku 项
    color = ui.color.text();
    size = ui.size.text();
    volume = ui.volume.text();
    type = ui.type.text();
    other = ui.other.text();

    //购买按钮名称
    buyName = ui.buyName.text();
    //商品名称
    itemName = ui.itemName.text();

    //校验价格
    checkPrice = ui.checkPrice.checked;
    //最高价格
    maxPrice = parseInt(ui.maxPrice.getText());

    //开始时间
    startTime = ui.startTime.getText().toString();
    //使用网络时间
    isUseNetTime = ui.isUseNetTime.isChecked();
    //任务提前时间 毫秒
    forwardTime = parseInt(ui.forwardTime.getText());
    //设备启动延迟抵扣量
    deviceDelay = parseInt(ui.deviceDelay.getText());
    //提交订单频率 毫秒
    interval = parseInt(ui.interval.getText());
    //抢购时长
    lastTime = parseInt(ui.lastTime.getText());
    xp = parseInt(ui.xp.getText());
    yp = parseInt(ui.yp.getText());

    if (!strDateTime(startTime)) {
        ui.startTime.setError("请输入正确的日期");
        return;
    } else if (forwardTime > 1000) {
        ui.forwardTime.setError("请输入0-1000之间的值");
        return;
    }

    storage.put("autoPay", autoPay);

    storage.put("jlModel", jlModel);
    storage.put("jlhz", jlhz);

    storage.put("checkSku", checkSku);
    storage.put("skuDelay", skuDelay);

    storage.put("buyName", buyName);
    storage.put("itemName", itemName);

    // storage.put("checkPrice", checkPrice);
    // storage.put("maxPrice", maxPrice);
    storage.put("isUseNetTime", isUseNetTime);

    storage.put("forwardTime", forwardTime);
    storage.put("interval", interval);
    storage.put("lastTime", lastTime);
    storage.put("deviceDelay", deviceDelay);

    storage.put("xp", xp);
    storage.put("yp", yp);

    //启动任务
    if (ui.runButton.text() == "开始运行") {
        skuNum = 0;
        //保持屏幕常亮
        device.keepScreenOn();
        //开启控制台
        threads.start(openConsole);
        //开始任务
        threads.start(doJob);
        ui.runButton.text("停止运行");
    } else {
        ui.runButton.text("开始运行");
        logInfo("停止运行");
        skuNum = 0;
        threads.start(function () {
            //关闭控制台
            console.hide();
            device.cancelKeepingAwake();
            if (workId) {
                clearTimeout(workId);
            }
            threads.shutDownAll();
        });
    }

    //保持脚本运行
    setInterval(() => { }, 1000);
});

/**
* 开始任务
*/
function doJob() {

    logInfo("脚本开始运行，当前时间偏移: " + NTPClockOffset + " 网络延迟: " + NTPClockDelay);
    //开始时间戳
    var startChecktime = new Date(Date.parse(startTime)).getTime();
    //获取结束时间
    var endTime = startChecktime + lastTime * 1000 - forwardTime;
    //任务开始时间
    var startChecktimeFix = startChecktime - forwardTime;
    //开始刷新的时间
    // var startFlashTime = startChecktime - flushTime;

    logInfo("预期开始抢购时间为：" + formatDate(startChecktimeFix));
    logInfo("预期结束抢购时间为：" + formatDate(endTime));


    if (endTime - getNow() < 0) {
        logError("超出预定抢购时长，抢购结束");
        threads.shutDownAll();
        return;
    }

    var stopThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            if (endTime - getNow() < 0) {
                logError("超出预定抢购时长，抢购结束");
                threads.shutDownAll();
                return;
            }
            sleep(1000);
        }
    });


    logCommon("淘宝商品橱窗模式(活动页或收藏页)");
    logCommon("正在打开手机淘宝...");
    launchApp("手机淘宝");
    waitForPackage("com.taobao.taobao");
    logCommon("请进入活动或收藏页面...");


    var readThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            //等待商品详情页
            waitForActivity("android.app.Dialog");
            //查找确认
            // var confirm = className("android.widget.TextView").textContains("确定").findOne();
            var confirm = textContains("确定").findOne();
            var confirmButton = findClickableItem(targetItem);
            if (confirmButton.clickable()) {
                logCommon("确定-a：" + confirmButton.click());
            } else {
                var scope = confirm.bounds();
                logCommon("确定-as：" + click(scope.centerX(), scope.centerY()));
            }
            sleep(1000);
        }
    });


    var sleepThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            logCommon("被盾：" + textContains("休息会").findOne().text());
            var sleepScope = textContains("向右滑动验证").findOne().bounds();

            var sx = sleepScope.left + (sleepScope.bottom - sleepScope.top) / 2;
            var ex = sleepScope.right - (sleepScope.bottom - sleepScope.top) / 2;
            var y = sleepScope.top + (sleepScope.bottom - sleepScope.top) / 2;

            logCommon("开始滑动")
            randomSwipe(sx, y, ex, y);
            logCommon("滑动完成")
            sleep(100);
        }
    });

    var readThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            var readButton = textContains("我知道了").findOne();
            log("被盾了：" + readButton.click());
            sleep(100);
        }
    });

    var successThread = threads.start(function () {
        //在新线程执行的代码
        while (true) {
            var payButton = textContains("立即付款").findOne();
            logError(timeUtils.getLogTime(), "下单成功");
            if (autoPay) {
                payButton.parent().click();
                logError(timeUtils.getLogTime(), "尝试支付...");
            }
            sleep(1000);
            threads.shutDownAll();
            return;
        }
    });

    //处理sku
    var skus = [color, size, other, volume, type];
    if (checkSku) {
        for (var i = 0; i < skus.length; i++) {
            let sku = skus[i];
            // logCommon("查找" + sku);
            if (sku) {
                threads.start(function () {
                    waitForActivity("com.taobao.android.detail.wrapper.activity.DetailActivity");
                    let needSearch = true;
                    while (needSearch) {
                        if (desc(sku).enabled(true).selected(false).exists()) {
                            var color = desc(sku).enabled(true).selected(false).findOne();
                            var colorButton = findClickableItem(color);
                            needSearch = false;
                            skuNum++;
                            myQueue.push(colorButton);
                        } else if (text(sku).enabled(true).selected(false).exists()) {
                            var color = text(sku).enabled(true).selected(false).findOne();
                            var colorButton = findClickableItem(color);
                            needSearch = false;
                            skuNum++;
                            myQueue.push(colorButton);
                        } else {
                            // logError("未找到" + sku);
                            sleep(50);
                        }
                    }
                });
            }
        }
    }

    //开始干活
    var item = getItem(itemName);
    var itemButton = findClickableItem(item);
    logCommon("已在活动页定位商品，请确保需要抢购的商品已配置好sku等信息，并设置好购买价格，脚本将自动抢购...");

    logCommon("模式确认为定时橱窗、收藏模式，等待开抢...");
    workId = setTimeout(function () {
        doTbCheckJob(itemButton, item);
    }, startChecktimeFix - getNow() - deviceDelay);

}

/**
* tb捡漏模式下单
*/
function doTbCheckJob(itemButton, targetItem) {

    logInfo("开始抢购...");
    console.time("进入详情时间");
    //是否有货
    var waitForStock = false;
    while (!waitForStock) {
        if (itemButton) {
            logCommon("商品详情:" + itemButton.click());
        } else {
            var scope = targetItem.bounds();
            logCommon("商品详情-s:" + click(scope.centerX(), scope.centerY()));
        }
        //等待商品详情页
        waitForActivity("com.taobao.android.detail.wrapper.activity.DetailActivity");
        //如果购买标识不存在，返回
        // if (!id("detail_main_sys_button").className("android.widget.TextView").textContains(buyName).enabled(true).exists()) {
        //     logError("未找到[" + buyName + "],返回重试...");
        //     itemDetailBack();
        //     //重新查找商品
        //     targetItem = getItem(itemName);
        //     itemButton = findClickableItem(targetItem);
        //     sleep(jlhz);
        //     continue;
        // }
        //查找立即购买按钮
        var buyButton = id("detail_main_sys_button").className("android.widget.TextView").textContains(buyName).enabled(true).findOne();
        buyButton = findClickableItem(buyButton);
        if (!buyButton) {
            logError("查找购买按钮失败");
            if (jlModel) {
                itemDetailBack();
                //重新查找商品
                targetItem = getItem(itemName);
                itemButton = findClickableItem(targetItem);
                continue;
            }
        }
        waitForStock = buyButton.click();
        logCommon(buyName + ":" + waitForStock);
        if (!waitForStock) {
            //如果购买标识存在，但是无法点击返回
            if (jlModel) {
                itemDetailBack();
                //重新查找商品
                targetItem = getItem(itemName);
                itemButton = findClickableItem(targetItem);
                sleep(jlhz);
                continue;
            }
        }
    }
    console.timeEnd("进入详情时间");
    console.time("进入提交时间");
    if (checkSku) {
        threads.start(function () {
            while (true) {
                var skuButton = myQueue.pop();
                if (skuButton) {
                    if (!skuButton.selected()) {
                        skuButton.click();
                        skuNum--;
                    }
                } else {
                    sleep(50);
                }
            }
        });
    }
    if (needConfirm) {
        //查找确认
        threads.start(function () {
            while (true) {
                var confirm = id("confirm").enabled(true).findOne();
                var confirmButton = findClickableItem(confirm);
                if (skuNum <= 0) {
                    sleep(skuDelay)
                    logCommon("确认:" + confirmButton.click());
                    break;
                } else {
                    sleep(interval);
                }
            }
        });
    }
    //查找提交订单页面
    var submit = className("android.widget.TextView").text("提交订单").enabled(true).findOne();
    var submitButton = findClickableItem(submit);
    console.timeEnd("进入提交时间");
    while (true) {
        if (checkPrice) {
            text("小计: ").findOne().parent().children().forEach(child => {
                var target = child.findOne(className("android.widget.TextView").textContains("￥"));
                if (target != null) {
                    var itemPriceStr = parseInt(target.text().replace("￥", ""));
                    var priceStr = parseInt(itemPriceStr);
                    if (priceStr && (priceStr <= maxPrice)) {
                        // log("提交订单:" + click(initParam.submitScopeX,initParam.submitScopeY));
                        logCommon("提交订单:" + submitButton.click());
                        // log("提交订单");
                        sleep(interval);
                    } else {
                        logError("商品价格：" + itemPriceStr + "，超过限制金额：￥" + maxPrice);
                    }
                }
            });
        } else {
            // log("提交订单:" + click(initParam.submitScopeX,initParam.submitScopeY));
            logCommon("提交订单:" + submitButton.click());
            // log("提交订单");
            sleep(interval);
        }
    }
}

/**
 * 查找商品点击
 * @param {*} itemButton 
 */
function findClickableItem(item) {
    var checkItem = item;
    while (true) {
        if (checkItem.clickable()) {
            // log("找到：" + checkItem);
            return checkItem;
        } else {
            // log("没找到，找父类")
            checkItem = checkItem.parent();
            if (checkItem == null) {
                // log("找不到")
                return null;
            } else {
                // log("找到父类：" + checkItem)
            }
        }
    }
}

/**
* 退出商品详情页
*/
function itemDetailBack() {
    logCommon("退出商品详情页：" + className("android.widget.TextView").desc("返回").findOne().click());
}
/**
* sku页面
*/
function itemSkuBack() {
    logCommon("退出sku页：" + id("btn_skucard_closecard").findOne().click());
}
/**
* 退出提交订单页面
*/
function submitBack() {
    logCommon("退出提交订单页：" + id("btn_back").findOne().click());
}

/**
* 查找商品
*/
function getItem(itemName) {
    logCommon("开始查找商品：" + itemName);
    var target;
    while (true) {
        if (textContains(itemName).exists()) {
            target = textContains(itemName).findOne();
            logInfo("找到" + target.text());
        } else if (descContains(itemName).exists()) {
            target = descContains(itemName).findOne();
            logInfo("找到" + target.desc());
        }
        if (target) {
            return target;
        } else {
            sleep(500);
        }
    }
}


/**
 * 检查是否适用急速sku模式
 */
function doCheckFastJob() {
    //sku 项
    color = ui.color.text();
    size = ui.size.text();
    volume = ui.volume.text();
    type = ui.type.text();
    other = ui.other.text();
    other = ui.other.text();
    skuDelay = ui.skuDelay.text();
    logCommon("正在打开手机淘宝...");
    launchApp("手机淘宝");
    waitForPackage("com.taobao.taobao");
    var checkThread = threads.start(function () {
        while (true) {
            if (!textContains("加入购物车").exists()) {
                logCommon("未进入商品详情页，请前往");
                textContains("加入购物车").findOne();
                logCommon("已进入商品详情页，开始测试sku选择");
                continue;
            }
            sleep(1000);
        }
    });
    var addCart = textContains("加入购物车").findOne();
    logCommon("点击加入购物车，打开sku确认页面：" + addCart.click());
    var skus = [color, size, volume, type, other];

    var startSku = false;
    console.time("sku选择耗时");
    for (var i = 0; i < skus.length; i++) {
        let sku = skus[i];
        // logCommon("查找" + sku);
        if (sku) {
            threads.start(function () {
                var needSearch = true;
                while (needSearch) {
                    if (desc(sku).enabled(true).selected(false).exists()) {
                        var color = desc(sku).enabled(true).selected(false).findOne();
                        var colorButton = findClickableItem(color);
                        logInfo("找到" + sku);
                        needSearch = false;
                        skuNum++;
                        myQueue.push(colorButton);
                        startSku = true;
                    } else if (text(sku).enabled(true).selected(false).exists()) {
                        var color = text(sku).enabled(true).selected(false).findOne();
                        var colorButton = findClickableItem(color);
                        logInfo("找到" + sku);
                        needSearch = false;
                        skuNum++;
                        myQueue.push(colorButton);
                        startSku = true;
                    } else {
                        logError("未找到" + sku);
                        sleep(1000);
                    }
                }
            });
        }
    }

    threads.start(function () {
        while (true) {
            var skuButton = myQueue.pop();
            if (skuButton) {
                if (!skuButton.selected()) {
                    skuButton.click();
                    skuNum--;
                }
            } else {
                sleep(50);
            }
        }
    });

    //查找确认
    threads.start(function () {
        while (true) {
            var confirm = id("confirm").enabled(true).findOne();
            var confirmButton = findClickableItem(confirm);
            if (skuNum <= 0) {
                sleep(skuDelay)
                logCommon("确认:" + confirmButton.click());
                break;
            } else {
                sleep(50);
            }
        }
    });

    while (!startSku) {
        sleep(50);
    }
    while (skuNum > 0) {
        sleep(50);
    }
    console.timeEnd("sku选择耗时");

    logCommon("测试完成,如果没有选中,可能是sku属性填写错误,属性需要完全一致！");
}


function ArrayQueue() {
    var arr = [];
    //入队操作  
    this.push = function (element) {
        arr.push(element);
        return true;
    }
    //出队操作  
    this.pop = function () {
        return arr.shift();
    }
    //获取队首  
    this.getFront = function () {
        return arr[0];
    }
    //获取队尾  
    this.getRear = function () {
        return arr[arr.length - 1]
    }
    //清空队列  
    this.clear = function () {
        arr = [];
    }
    //获取队长  
    this.size = function () {
        return arr.length;
    }
}