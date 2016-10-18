var myApp = angular.module('starter.controllers', []);
myApp.controller('homeCtrl', function($scope, $ionicTabsDelegate, getArticleList, $http, $ionicPopup, $timeout, $cordovaDatePicker, $rootScope, $cordovaNetwork) {
            //.success(function(resp){console.log(resp);}).error(function(error){console.log(error);})
            $scope.imgUrl = urls.imgUrl;
            var userId = window.localStorage[cache.userId];
            var page = 1,
                count = 10;
            var isLock = false;
            $scope.items = [];

            getArticleList.getArticles(userId, page, count).success(function(resp) {
                console.log(resp);
                $scope.items = resp.result.data;
            }).error(function(error) {
                console.log(error);
            });

            // 
                    // document.addEventListener("deviceready", function () {

                    //         $scope.network = $cordovaNetwork.getNetwork();
                    //         $scope.isOnline = $cordovaNetwork.isOnline();
                    //         $scope.$apply();

                    //         // listen for Online event
                    //         $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
                    //             $scope.isOnline = true;
                    //             $scope.network = $cordovaNetwork.getNetwork();

                    //             $scope.$apply();
                    //         })

                    //         // listen for Offline event
                    //         $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
                    //             console.log("got offline");
                    //             $scope.isOnline = false;
                    //             $scope.network = $cordovaNetwork.getNetwork();

                    //             $scope.$apply();
                    //         })

                    //   }, false); 
            //
            // $ionicPlatform.ready(function() {
            //     $scope.onNetwork = function() {
            //     var type = $cordovaNetwork.getNetwork()
            //     $scope.type = type;//"cellular""wifi"
            //     var isOnline = $cordovaNetwork.isOnline()
            //     $scope.isOnline = isOnline;
            //     var isOffline = $cordovaNetwork.isOffline()
            //     $scope.isOffline = isOffline;
            //     // listen for Online event
            //     $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
            //         var onlineState = networkState;
            //         console.log(onlineState);
            //     })

            //     // listen for Offline event
            //     $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
            //         var offlineState = networkState;
            //         console.log(onlineState);
            //     })
            //     }
            // })
            



     $scope.ShowDate=function(){
        var options = {
            date: new Date(),
            mode: 'date', // or 'time'
            minDate: new Date() - 10000,
            allowOldDates: true,
            allowFutureDates: false,
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
          };

      //document.addEventListener("deviceready", function () {

        $cordovaDatePicker.show(options).then(function(date){
             console.log(',,,$cordovaDatePicker.show,,,', $cordovaDatePicker.show);
            alert(date);
            $scope.SelectDate = date;
        });
        //}, false);
    }
    
    $scope.loadMore = function() {
    if (isLock) return;
    isLock = true;
    getArticleList.getArticles(userId, page, count).success(function(resp) {
        if (resp.code == "200") {
            if (resp.result.data.length > 0) {
                $scope.items = resp.result.data.concat($scope.items);
                //page++;
            } else {
                console.log("没有数据了...")
                isLock = true;
            }
        } else if (resp.code == "404") {
            var tip = $ionicPopup.alert({ title: '提示', template: "文章显示完毕！" });
            $timeout(function() {
                tip.close();
            }, 1000)
        }
    }).finally(function(error) {
        isLock = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
    });
};

    $scope.doRefresh = function () {
        page++;
        $scope.loadMore();
    }

    // $scope.doRefresh = function() {
    //     $scope.$broadcast("scroll.refreshComplete");
    // };
    // 
    //测试用静态数据
    //$scope.items = art;
    // $scope.doRefresh=function(){
    //     getArticleList.doRefresh();
    //     $scope.$broadcast("scoll.refreshComplete")
    // };  
    //阅读数
    // $scope.readNum=function(){
    //     var readNum = config.art_read
    //     //判断用户状态，并认定只有同一个ID才能加1
    //     if(localStorage.username==""){
    //         readNum++;
    //         config.art_read = redNum;
    //     }else{
    //          state.go("")
    //     }
    // }
    
   
});


myApp.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
myApp.controller('loginCtrl', function($scope, AccountService, $state,$ionicPopup,$ionicHistory) {
    $scope.phone = {
        tel: ''
    };
    $scope.checkSendCode = function() {
        var phone = $scope.phone.tel;
        var phoneReg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        if (!phoneReg.test(phone) || phone =="" || phone == undefined) {
             $ionicPopup.alert({ title: '提示', template:"请输入有效的手机号码！"})
            return false;
        } else {
            AccountService.reg(phone).success(function(resp) {
                console.log(resp);
                //超过同一手机发送验证码次数上限，改天再试
                if(resp.status[0]==160040){
                    $ionicPopup.alert({ title: '提示', template:resp.message[0]})
                    return;
                }else{
                    var sendSeconds = new Date().getTime();
                    window.localStorage[cache.sendCodeTime] = sendSeconds;//时间戳   todo设置过期时间
                    $state.go("loginCode", { phone: $scope.phone.tel });
                }
            }).error(function(error) {
                console.log(error);
            });

            
        }
    }
    $scope.sendCode = function() {
        var firstSendTime = window.localStorage[cache.sendCodeTime];
        var nowTime = new Date().getTime();
        var expireTime = nowTime - firstSendTime;
        if (!firstSendTime || expireTime > DELEY*1000) {
            $scope.checkSendCode();
        } else {
            $state.go("loginCode", { phone: $scope.phone.tel });
        }
 
        // else if( expireTime < DELEY){
        //     //提示不能重新发送验证码
        //     alert("间隔时间过短");
        //     //$ionicPopup
        // }

    };
});
myApp.controller('loginCodeCtrl', function($scope, $rootScope, $stateParams, $state, $ionicPopup, AccountService, $timeout, $ionicHistory) {
    var phone = $stateParams.phone;
    $scope.data = {
            code: ""
        }
        //{"status":0,"message":"发送成功"}
    $scope.completeLogin = function() {
        var code = $scope.data.code;
        var codeReg = /^\d{6}$/;
        if (!codeReg.test(code)) {
            $ionicPopup.alert({ title: '提示', template: "请输入有效的验证码！" })
            return false;
        } else {
            AccountService.login(phone, code).success(function(resp) {
                console.log(resp);
                // {code:200,message:"检验成功",result:null,status:"success"}
                if (resp.code == "200") {
                     window.localStorage[cache.smsId] = resp.result.id;
                    if (resp.result && resp.result.nickname) {
                        window.localStorage[cache.logined] = "true";
                        window.localStorage[cache.token] = resp.result.token;
                        window.localStorage[cache.userId] = resp.result.user_id;
                        window.localStorage[cache.user] = JSON.stringify(resp.result);
                        $rootScope.user = AccountService.getCacheUser();
                        $state.go("home");
                        $ionicPopup.alert({ title: '提示', template: "登录成功" })
                        $ionicHistory.nextViewOptions({
                            disableAnimate: false,
                            disableBack: true
                        });
                    } else {
                        $state.go("loginComplete");
                    }
                } else if (resp.code == "403") {
                    $ionicPopup.alert({ title: '提示', template: resp.message });
                }
                //  else if (resp.code == "404") { //|| !resp.result.nickname
                //     $state.go("loginComplete");
                // }

            }).error(function(error) {
                $ionicPopup.alert({ title: '提示', template: "服务器错误" });
                removeInfo();
            });
        }

    };

    $scope.sendButTxt = DELEY + '秒后重发';
    $scope.sendState = 0;
    $timeout(function() {
        $scope.sendSMS(DELEY);
    }, 1000);


    $scope.reSend = function() {
        if ($scope.sendState != 1) {
            return;
        }
        AccountService.reg(phone).success(function(resp) {
            console.log(resp);
            if (resp.status == 0) {
                $scope.sendSMS(DELEY);
            }
        }).error(function(error) { console.log(error); });
    };
    $scope.sendSMS = function(i) {
        if (i > 0) {
            $scope.sendButTxt = i + '秒后重发';
            $scope.sendState = 0;
            i--;
            $timeout(function() {
                $scope.sendSMS(i);
            }, 1000);
        } else {
            $scope.sendButTxt = '发送验证码';
            $scope.sendState = 1;
        }
    };
});


myApp.controller('loginCompleteCtrl', function($scope,$rootScope,$cordovaDatePicker, $ionicPopup, $cordovaCamera, $ionicActionSheet,AccountService, $state, 
    $ionicHistory, $location) {
    // var token =window.localStorage[cache.token];
     var token ="";
     var userId ="";
     var smsId = window.localStorage[cache.smsId]-0 ;
    $scope.userInfo  = {
        avatar:curUser.avatar,//curUser.avatar
        name: "",
        sex: "女",
        birthday:"19990101"
    } 
    var userInfo = $scope.userInfo;
    $scope.complete = function() {
       // var reg = /[a-zA-Z0-9]{1,10}|[\u4e00-\u9fa5]{1,5}/g;
        var regName=/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9_\u4E00-\u9FA5]{1,15}$/;
        var regSex= /^['男'|'女']$/;
        var regBirth=/^(19|20)\d{2}(1[0-2]|0[1-9])(0[1-9]|[1-2][0-9]|3[0-1])$/;

        if(!userInfo.name||!regName.test(userInfo.name)){
            $ionicPopup.alert({ title: '提示', template: "昵称由字母、数字、下划线和中文组成，以中文或字母开头，长度为2-16位"});
            return false;
        }
        if(userInfo.sex && !regSex.test(userInfo.sex)){
            $ionicPopup.alert({ title: '提示', template: "选填，‘男’或者‘女’"});
             return false;;
        }
        if(userInfo.birthday && !regBirth.test(userInfo.birthday)){
            $ionicPopup.alert({ title: '提示', template: "选填，生日格式:19990101"});
            return false;;
        }
        AccountService.uploadUser(userInfo,smsId).success(function(resp) {
            console.log(resp);
            //{status: "error", code: 4003, message: "user不存在"}
            if (resp.code == "200") {
            $ionicPopup.alert({ title: '提示', template:"注册成功"  }) 
                $state.go("home");
               //resp.result.user_id
                window.localStorage[cache.logined] = "true";
                token = window.localStorage[cache.token] = resp.result.token;
                userId = window.localStorage[cache.userId] = resp.result.user_id;
                //这是用户首次注册成功后，保存信息
                userId && AccountService.getUserInfo(userId);
                //$rootScope.user = AccountService.getCacheUser();
                 $ionicHistory.nextViewOptions({
                  disableAnimate: false,
                  disableBack: true
                });

            } else if(resp.code == "4000"){
                 $ionicPopup.alert({ title: '提示', template:"token问题"  }) 
            }else if(resp.code == "400"){
                 $ionicPopup.alert({ title: '提示', template:resp.message  }) 
            }else {
                $ionicPopup.alert({ title: '提示', template:"有问题"  }) //resp.message
            }
        }).error(function(error) {
            $ionicPopup.alert({ title: '提示', template:"服务器错误" })//error
        })

    }

    var callCamera = function(sourceType) {
        var options = {
            quality: 100, //图片质量 100为最佳
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: sourceType, // PHOTOLIBRARY = 0  CAMERA = 1  SAVEDPHOTOALBUM = 2
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation: true
        };
        $cordovaCamera.getPicture(options).then(function(imageData) {
            var image = document.getElementById('myImage');
            $scope.userInfo.avatar= "data:image/jpeg;base64," + imageData;
        }, function(err) {
            console.log("发生错误");
        });
    }
    $scope.changeAvatar = function() {
        $ionicActionSheet.show({
            buttons: [
            { text: '<span class="selectImg">相机</span>' },
            { text: '<span class="selectImg">从手机相册选择</span>' },
            ],
            // destructiveText: 'Delete',
            titleText: '选择调用类型?',
            cancelText: '<span class="selectCancel">Cancel</span>',
            buttonClicked: function(index) {
                switch (index) {
                    case 0:
                        callCamera(Camera.PictureSourceType.CAMERA)
                        break;
                    case 1:
                        callCamera(Camera.PictureSourceType.PHOTOLIBRARY)
                        break;
                    default:
                        break;
                }
                return true;
            }
        })
    }

   
});

myApp.controller('sideMenuCtrl', function($scope,$rootScope, $location, $anchorScroll, $ionicModal, AccountService, $http, $state) {
      $scope.$on('$ionicView.beforeEnter',function(){
        var _user = AccountService.getCacheUser();
        $rootScope.user = (_user == undefined)?{}: _user;
      })
     // var _user = AccountService.getCacheUser();
     // $rootScope.user = (_user == undefined)?{}: _user;

    $scope.openLogin = function() {
        var logined=window.localStorage[cache.logined];
        var _user  = AccountService.getCacheUser();
        if (logined=="true" && _user && _user.nickname) {
            $state.go("usercenter");
        } else {
            $state.go("login");
        }
    }
    $scope.goMessage = function() {
        //TODO 判断是否登录
        $state.go("message");
    }
    $scope.goFav = function() {
        //TODO 判断是否登录
        $state.go("favourite");
    }
    $scope.goSetting = function() {
        $state.go("setting");
    }
    $scope.goComment = function() {
        //TODO 判断是否登录
        $state.go("comment");
    }
});

myApp.controller('usercenterCtrl', function($scope,$rootScope, AccountService, $state, $ionicHistory, $ionicPopup,$ionicActionSheet) {
    var userId = window.localStorage[cache.userId];
    console.log(userId);
    AccountService.getUserInfo(userId); //切换用户时
    $scope.user =  $rootScope.user = AccountService.getCacheUser();//取localstorage的值
    $scope.doRefresh = function() {
        AccountService.getUserInfo(userId);
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.loginOut = function() {
        removeInfo();
        $rootScope.user= {}
        console.log("注销成功");
        $state.go("home");
        $ionicHistory.nextViewOptions({
            disableAnimate: false,
            disableBack: true
        });
    }
});


myApp.controller('settingCtrl', function($scope, $state) {

    $scope.settingsList = {
        msg_push: true, //消息推送
        wifi_autoCache: true, //自动缓存
        network_play: false // 移动网络播放视频
    };
    $scope.appCache = '9.18M';
    //清除缓存
    $scope.clearCache = function() {
        $scope.appCache = '0M';
    };
    //推荐飞地
    $scope.tuijian = function() {
        console.log("推荐飞地");
    };
    //给个好评
    $scope.givePraise = function() {
        console.log("给个好评");
    };
});
myApp.controller('articleDetailCtrl', function($scope, $state, $stateParams, $ionicActionSheet, 
    $ionicPopup, $timeout, getArticleList, ArticleService,FavService,ComService) {
    var replayList = $scope.replyCommentList = [];
    var curList = $scope.currentArticleComList = [];
     
    var artId=0;
    var type = "article";
    var page=1;
    var count=10;
    $scope.hasMedia=true;
    $scope.imgUrl = urls.imgUrl;
    console.log($stateParams);
    var id = $stateParams.art_id;

    function getComments() {
    ArticleService.getDetails(id).success(function(resp) {
        console.log(resp);
        $scope.item = resp.result;
        artId = resp.result.art_id;
        mediaOption.file = resp.result.art_media;
        mediaOption.image = $scope.imgUrl + resp.result.art_thumb;
        if (resp.result.art_media) {
            $scope.hasMedia = true;
        } else {
            $scope.hasMedia = false;
        }
    }).success(function() {
        ComService.getSingleCom(type, artId, page, count).success(function(resp) {
            console.log(resp);
            if (resp.code == 200) {
                $scope.hasComment = true;
                var data = resp.result.data.reverse(); // len = data.length;
                var comments = [];
                angular.forEach(data, function(item) {
                    console.log(item.pid);
                    var c = {
                        id: item.id,
                        nickname: item.author.nickname,
                        avatar: item.author.avatar,
                        content: item.content,
                        publishTime: item.publishTime,
                        sourceId: item.sourceId,
                        comments: []
                    };
                    var isChild = false;

                    for (var i = 0; i < comments.length; i++) {
                        if (item.pid == comments[i].id) {
                            isChild = true;
                            comments[i].comments.push(c)
                            break;
                        }
                    }
                    if (isChild == false) {
                        comments.push(c);
                    }
                });
                $scope.comments = comments.reverse();
                $scope.currentArticleComTotal = resp.result.pageInfo.total
            };
            if (resp.code == 404) {
                $scope.hasComment = false;
                $scope.currentArticleComTotal = 0;
                $scope.noComment = resp.message //没有任何评论信息
            }
            //resp.code==400
            //{status: "error", code: 400, message: "type字段不能为空"}
        }).error(function(error) {console.log(error);});
    }).error(function(error) { console.log(error); })
}


    //console.log(mediaOption.media);
    
    /**
     及时更新最新的评论 监听beforeEnter
     */
    $scope.$on('$ionicView.beforeEnter',function(){
        ComService.getSingleCom(type, artId, page, count).success(function(resp){
        console.log(resp);
        if(resp.code==200){
            $scope.hasComment=true;
            $scope.currentArticleComList = resp.result.data;
            $scope.currentArticleComTotal = resp.result.pageInfo.total
        };
        if(resp.code==404){
            $scope.hasComment=false;
            $scope.currentArticleComTotal = 0;
            $scope.noComment = resp.message //没有任何评论信息
        }
        //resp.code==400
        //{status: "error", code: 400, message: "type字段不能为空"}
        }).error(function(error){

        });
    })
    /**
     判断当时的媒体是视频音频还是图片
     */
    $scope.$on('$ionicView.enter',function(){
        getComments();
      console.log("$ionicView.enter");
      //var media = $("#art_media");
      if($scope.hasMedia){   //todo 多切换几个文章试试有无报错
          jwplayer("art_media").setup(mediaOption);
        } 
      //音频播放背景图片的问题
    });

    // //获取评论

    // $scope.$on("onRenderFinished",function(onRenderFinishedEvent){
    //     var thePlayer = jwplayer("art_media").setup({
    //         flashplayer: 'js/player.swf',
    //         file: 'media/play.mp4',
    //         width: 500,
    //         height: 350,
    //         image: 'img/ben.png',
    //         dock: false
    //     });
    // })

    $scope.flag = {
        isAdd: false,
        tipTest: ''
    };
    $scope.add = function() {        
        $scope.flag.isAdd = !$scope.flag.isAdd;
        $scope.flag.tipTest = $scope.flag.isAdd ? "收藏成功" : "取消收藏";
        var tip = $ionicPopup.show({
            title: '提示',
            template: "<p style='text-align:center'>" + $scope.flag.tipTest + "</p>"
        })
        $timeout(function() {
            tip.close(); 
        }, 1000)
        //根据ID和token增加收藏数
        //FavService.getFav().success().error();
    };
    $scope.pubComment = function() {
        //$state.go("comment_pub",{data:$scope.item});

        if(window.localStorage[cache.logined]==="true"){
             $state.go("comment_pub",{data:$scope.item});
         }else{
           var tip = $ionicPopup.show({title: '提示',template: "请登录!"})
                $timeout(function() {
                tip.close(); 
            }, 1000)
         }
       
    };
    $scope.replyCom = function(){
        var $this = this;
        console.log($this.comment);
        //针对用户的判断是不是本人  TODO
        //if(当前id==pid){
            //是本人，直接无视
       // }else{

        //}
        
        $state.go("comment_reply",{data:$this.comment});
    };
    // $scope.share = function(title, desc, url, thumb){
    //    var hideSheet =  $ionicActionSheet.show({
    //         buttons:[
    //             {text:"<b>分享至微信朋友圈</b>"},
    //             {text:"分享给微信好友"},
    //         ],
    //         titleText:"分享",
    //         cancelText:"取消",
    //         cancel:function(){},
    //         buttonClicked:function(index){
    //             if(index==0){
    //                 $scope.shareViaWechat(WeChat.Scene.timeline,title,desc,url,thumb);
    //             }
    //             if(index==1){
    //                 $scope.shareViaWechat(WeChat.Scene.session,title,desc,url,thumb)
    //             }
    //         },
    //     });

    //    // $timeout(function() {
    //    //    hideSheet();
    //    //  }, 2000);
    // };
    // $scope.shareViaWechat = function(scene, title, desc, url, thumb){
    //     var msg = {
    //         title:title?title:"fd标题",
    //         description:desc?desc:"fd描述",
    //         url:url?url:"http://enclavemedia.cn/",
    //         thumb:thumb?thumb:null
    //     };
    //     WeChat.share(msg,scene,function(){
    //         $ionicPopup.alert({
    //             title:"Share success",
    //             template:"Thanks for your support",
    //             okText:"close"
    //         },function(res){
    //             $ionicPopup.alert({
    //                 title:"Share failed",
    //                 template:"error:"+res+".",
    //                 okText:"I know"
    //             })
    //         })
    //     })
    // };
});
//回复评论
myApp.controller('replyCommentCtrl', function($scope, $state, $stateParams, ComService, $ionicHistory, $ionicPopup) {
    $scope.imgUrl = urls.imgUrl;
    var data = $stateParams.data;
    $scope.commentItem = data;
    $scope.replyComment = {
        content: ""
    }
    console.log($scope.commentItem );
    $scope.reply_send = function() {
        var content = $scope.replyComment.content;
        var userId = window.localStorage[cache.userId] - 0;
        var type = "article";
        var source_id = $scope.commentItem.sourceId;
        var pid = $scope.commentItem.id || 0;
        var page = 1;
        var count = 10;
        ComService.pubCom(userId, type, source_id, content, pid).success(function(resp) {
            console.log(resp);
            if (resp.code == 404) {
               $ionicPopup.alert({ title: '提示', template:"没有找到当前source_id下pid对应的评论信息"}); 
            }
            if (resp.code == 200) {
                $ionicPopup.alert({ title: '提示', template: resp.message });
                $ionicHistory.goBack();
            }
        }).error(function(error) {
            console.log(error);
        });
    }

})

//发布评论
myApp.controller('pubCommentCtrl', function($scope, $state, $stateParams, ComService, $ionicHistory, $ionicPopup) {
    $scope.imgUrl = urls.imgUrl;
    var data = $stateParams.data;
    $scope.item = data;
    $scope.pubCom = {
        content: ""
    }

    $scope.art_public = function() {
        var content = $scope.pubCom.content;
        var userId = window.localStorage[cache.userId] - 0;
        var type = "article";
        var source_id = $scope.item.art_id;
        var pid = pid || 0;
        var page = 1;
        var count = 10;
        ComService.pubCom(userId, type, source_id, content, pid).success(function(resp) {
            console.log(resp);
            if (resp.code == 4003) {
                $ionicPopup.alert({ title: '提示', template: resp.message });
            }
            if (resp.code == 200) {
                $ionicPopup.alert({ title: '提示', template: resp.message });
                $ionicHistory.goBack();
            }
        }).error(function(error) {
            console.log(error);
        });
    }

})
//个人评论列表
myApp.controller('commentListCtrl', function($scope, $state, $stateParams, ComService, $ionicHistory, $ionicPopup) {
    var user_id=window.localStorage[cache.userId] - 0;
    // var page = 1;
    // var count = 10;
    ComService.getSelfComment(user_id).success(function(resp){
            console.log(resp);
            if(resp.code==200){
            $scope.hasCommentMsg=true;
            //$scope.currentArticleComList = resp.result.data;
            //$scope.currentArticleComTotal = resp.result.pageInfo.total
        };
        if(resp.code==404){
            $scope.hasCommentMsg=false;
            //$scope.currentArticleComTotal = 0;
            $scope.CommentMsg = resp.message //没有任何评论信息
        }
        }).error(function(error){
            
        })
})


// 用户中心
//myApp.controller('loginController', function($scope) {
myApp.controller('usercenter', function($scope, $http) {
    //     $scope.user = {};
    //     $scope.user.username = '';
    //     $scope.user.password = '';
    //     $scope.user.headface = 'img/adam.jpg';

    //     if(localStorage.logined =="true"){
    //         //已经登录，不跳转，显示用户信息
    //          $scope.user.headface="img/"+localStorage.username+".jpg";
    //     }else{
    //         var modal=Modal.create({"login.html"}); //跳转到login页面
    //         modal.onDismiss(function(data){$scope.user.headface = "img/"+data+".jpg";})
    //         this.nav.present(model);
    //     };

    //     $scope.login= function(){
    //         if($scope.user.username==""){
    //             var toast = Toast.create({
    //                 message:"您输入的用户名有误！"，
    //                 duration:2000
    //             })
    //             this.nav.present(toast);
    //         }else{
    //             var loading=Loading.create({
    //                 content:"loading……",
    //                 spinner:"dots",
    //                 duration:3000
    //             })
    //             this.nav.present(loading);
    //             //真实逻辑是去请求登录的API，返回结果后进行loading
    //             //setTimeout(function(){loading.dismisss()},3000)
    //             //模拟密码为1.那就认为是登录成功了，并进行相关保存动作
    //             if( $scope.user.password=="1"){
    //                 localStorage.username=$scope.user.username;
    //                 localStorage.logined="true";
    //                 setTimeout(function() {
    //                     loading.dismiss();//隐藏进度条
    //                     this.viewController.dismiss($scope.user.username);//当前也就是自身页面也隐藏
    //                 }, 1000)
    //             }else{
    //                 var toast = Toast.create({
    //                 message:"登录失败"，
    //                 duration:2000
    //                 })
    //                 this.nav.present(toast);
    //             }
    //         }
    //     };
    //     $scope.loginOut=function(){
    //         localStorage.logined="";
    //         localStorage.username="";
    //         var model=Modal.create({"login.html"});  
    //           modal.onDismiss(function(data){$scope.user.headface = "img/"+data+".jpg";}) 
    //         this.nav.present(model);
    //     };

});
myApp.controller('messageCtrl', function($scope,$ionicHistory) {
  

});
