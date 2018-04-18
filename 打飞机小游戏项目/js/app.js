// 元素
var container = document.getElementById('game');

var CONFIG = {
  status: 'start', // 游戏开始默认为开始中
  level: 1, // 游戏默认等级
  totalLevel: 6, // 总共6关
  numPerLine: 7, // 游戏默认每行多少个怪兽
  canvasPadding: 30, // 默认画布的间隔
  bulletSize: 10, // 默认子弹长度
  bulletSpeed: 10, // 默认子弹的移动速度
  bulletDelay: 250,//默认子弹间隔
  enemySpeed: 2, // 默认敌人移动距离
  enemySize: 50, // 默认敌人的尺寸
  enemyGap: 10,  // 默认敌人之间的间距
  enemyIcon: './img/enemy.png', // 怪兽的图像
  enemyBoomIcon: './img/boom.png', // 怪兽死亡的图像
  enemyDirection: 'right', // 默认敌人一开始往右移动
  planeSpeed: 5, // 默认飞机每一步移动的距离
  planeSize: {
    width: 60,
    height: 100
  }, // 默认飞机的尺寸,
  planeIcon: './img/plane.png',
  bulletMaxy: 420,//怪物最大y 值
  bulletPadding: 30//怪物移动内边据
};

Array.prototype.min = function () {
  if (this.length) {
    var result = this[0];
    this.forEach(function (el) {
      if (el < result) {
        result = el;
      }
    });
    return result;
  }
};
Array.prototype.max = function () {
  if (this.length) {
    var result = this[0];
    this.forEach(function (el) {
      if (el > result) {
        result = el;
      }
    });
    return result;
  }
};

/**
 * 飞机,怪兽, 子弹 的抽象
 */
function Flyers(opts) {
  this.width = opts.width;
  this.height = opts.height;
  this.speed = opts.speed;
  this.x = opts.x || 0;
  this.y = opts.y || 0;
}
//移动
Flyers.prototype.move = function (director, step) {
  step = step || this.speed;
  switch (director) {
    case 'up':
      this.y -= step;
      break;
    case 'down':
      this.y += step;
      break;
    case 'left':
      this.x -= step;
      break;
    case 'right':
      this.x += step;
      break;
  }

};

//继承
function inheritPrototype(child, parent) {
  var proto = Object.create(parent.prototype);
  proto.constructor = child;
  child.prototype = proto;

}
//飞机
function Plane(opts) {
  Flyers.call(this, opts);
  this.icon = opts.icon;
}
inheritPrototype(Plane, Flyers);

//怪物
function Enemy(opts) {
  Flyers.call(this, opts);
  this.icon = opts.icon;
  this.enemyBoomIcon = opts.enemyBoomIcon;
  this.isLive = true;//默认是活的
  this.liveTime = opts.liveTime;
}
inheritPrototype(Enemy, Flyers);

//子弹
function Bullet(opts) {
  Flyers.call(this, opts);
  this.size = opts.size;
}
inheritPrototype(Bullet, Flyers);
Bullet.prototype.destroy = function () { };

/**
 * 整个游戏对象
 */
var GAME = {
  /**
   * 初始化函数,这个函数只执行一次
   * @param  {object} opts 
   * @return {[type]}      [description]
   */

  init: function (opts) {
    this.status = 'start';
    this.context.fillStyle = "#FFF";//文字颜色
    this.context.strokeStyle = "#FFF";//子弹颜色
    this.context.font = "18px ";
    this.bindEvent();
    this.crateFlyers(opts);

  },

  fraction: 0,//默认得分


  canvas: document.getElementById('canvas'),
  context: this.canvas.getContext('2d'),

  //清除画布功能
  clearCanvas: function () {
    this.context.clearRect(0, 0, canvas.width, canvas.height);
  },

  //运动中的物体  子弹  怪物  
  //飞机由鼠标控制
  moving: function () {
    this.moveEneys();//子弹的移动
    this.moveBullets();//怪物的移动
    this.impactCheck();//子弹碰撞检测
  },

  //游戏结束检查，
  overCheck: function () {
    var self = this;
    //当怪物中的某一个 的y 值超过其最大 高度值时，表示游戏结束
    if (this.enemys.some(function (el) {
      return el.y >= CONFIG.bulletMaxy;
    })) {
      self.failed();
    }

  },

  //子弹碰撞检测
  impactCheck: function () {
    //子弹碰撞到顶部
    //子弹碰撞到怪物
    var enemys = this.enemys;
    var bullets = this.bullets;
    var len_enemys = enemys.length;
    var len_bullets = bullets.length;
    for (var i = len_bullets - 1; i >= 0; i--) {
      //子弹到达顶部销毁
      if (bullets[i].y < CONFIG.bulletPadding) {
        bullets.splice(i, 1);
        continue;
      }
      //子弹与每一个怪物进行位置检测
      for (var j = len_enemys - 1; j >= 0; j--) {
        var en = enemys[j];
        var bu = bullets[i];
        if (en.x < bu.x && (en.x + en.width) > bu.x && en.y < (bu.y + bu.height) && bu.y < (en.y + en.height)) {
          //表示子弹与怪物接触
          bullets.splice(i, 1);//子弹与怪物接触，就销毁子弹
          en.isLive = false;//同时标记怪物状态，后续冲毁三次之后清除
          break;
        }
      }

    }
  },


  //怪物移动
  moveEneys: function () {
    //step1:先整体左右移动
    var x_arr = [];//存放怪物所有的x 这样才能精准的判断移动方向
    this.enemys.forEach(function (el) {
      x_arr.push(el.x);
    });
    var x_min = x_arr.min();
    var x_max = x_arr.max();


    //左移碰撞，改变移动方向，同时向下移动
    if (x_min < CONFIG.bulletPadding) {
      Enemy.prototype.direction = "right";
      this.downEneys();
    } else if (x_max + Enemy.prototype.width > this.canvas.width - CONFIG.bulletPadding) {
      //右壁碰撞，下移动，切换防线
      Enemy.prototype.direction = "left";
      this.downEneys();
    };
    //将每一个怪物进行移动
    this.enemys.forEach(function (el) {
      el.move(el.direction);
    });

  },
  //将怪物进行下移
  downEneys: function () {
    this.enemys.forEach(function (el) {
      el.y += CONFIG.enemySize;
    });
    //怪物下移时碰撞下壁检测
    this.overCheck();
  },

  //子弹移动
  moveBullets: function () {
    this.bullets.forEach(function (el) {
      el.y -= el.speed;
    });
  },

  //绘制
  draw: function () {
    this.drawPlane();//飞机
    this.drawEnemys();//怪物
    this.drawBullets();//子弹
    this.drawText();//文案
  },

  //画飞机
  drawPlane: function () {
    var P = this.plane;
    var self = this;
    this.context.drawImage(self.planeImg, P.x, P.y, P.width, P.height);

  },
  //画怪物
  drawEnemys: function () {
    var self = this;
    this.enemys.forEach(function (el, index) {
      if (el.isLive) {
        //表示存活的，
        self.context.drawImage(self.imgEnemy, el.x, el.y, el.width, el.height);
      } else {
        //表示已经被子弹击中
        if (el.liveTime) {
          //显示3帧的爆炸图
          el.liveTime--;
          self.context.drawImage(self.imgEnemyBoom, el.x, el.y, el.width, el.height);
        } else {
          //这里销毁怪物，同时增加积分（这里的积分增加位置不是很好）
          self.fraction++;
          self.enemys.splice(index, 1);
        }
      }
    });
  },

  //画子弹
  drawBullets: function () {
    var self = this;
    this.bullets.forEach(function (el) {
      self.context.beginPath();
      self.context.moveTo(el.x, el.y);
      self.context.lineTo(el.x, el.y + el.bulletSize);
      self.context.stroke();
    });
  },

  //画文案
  drawText: function () {
    this.context.fillText('分数：' + this.fraction, 20, 20);
  },

  //创造飞行物
  crateFlyers: function (opts) {
    this.plane = null;
    this.enemys = [];
    this.bullets = [];
    this.createPlane(opts);//创建飞机
    this.createEnemys(opts);//创建怪物
    this.initBullet(opts);//创建子弹
  },
  //创造飞机
  createPlane: function (opts) {
    planeOpts = {
      icon: opts.planeIcon,
      width: opts.planeSize.width,
      height: opts.planeSize.height,
      speed: opts.planeSpeed,
      x: 220,
      y: 470
    };
    this.plane = new Plane(planeOpts);//这里只有一个飞机，就直接在这初始化了
    var imgPlane = new Image();
    imgPlane.src = this.plane.icon;
    var self = this;
    //imgPlane.onload = function () {
      self.planeImg = imgPlane;
    //};
  },

  //怪物容器
  enemys: [],
  //创造怪物
  createEnemys: function (opts) {
    enemyOpts = {
      icon: opts.enemyIcon,
      width: opts.enemySize,
      height: opts.enemySize,
      speed: opts.enemySpeed,
      enemyBoomIcon: opts.enemyBoomIcon,
      liveTime: 3
    };


    Enemy.prototype.width = opts.enemySize;
    Enemy.prototype.gap = opts.enemyGap;
    Enemy.prototype.size = opts.enemySize;
    Enemy.prototype.direction = opts.enemyDirection;
    //根据级别，以及每排的怪物数量，对怪物进行初始化
    for (var j = 0; j < opts.level; j++) {
      enemyOpts.x = CONFIG.enemySize;
      for (var i = 0; i < opts.numPerLine; i++) {
        enemyOpts.x += opts.enemyGap + opts.enemySize;
        enemyOpts.y = CONFIG.enemySize * j;
        this.enemys.push(new Enemy(enemyOpts, i));
      }
    }

    //这里怪物图片是一致的，（可以想象，不同的怪物图片的加载,备注：谨防 程序运行时，图片还未加载上）
    var imgEnemy = new Image();
    imgEnemy.src = opts.enemyIcon;
    var self = this;
    //imgEnemy.onload = function () {
      self.imgEnemy = imgEnemy;
    //};
    var imgEnemyBoom = new Image();
    imgEnemyBoom.src = opts.enemyBoomIcon;
    //imgEnemyBoom.onload = function () {
      self.imgEnemyBoom = imgEnemyBoom;
    //}

  },

  //初始化子弹信息
  initBullet: function (opts) {
    Bullet.prototype.bulletSize = opts.bulletSize;
    Bullet.prototype.bulletSpeed = opts.bulletSpeed;
    //Bullet.prototype.bulletDelay = opts.bulletDelay;
  },

  //子弹容器
  bullets: [],
  //创造子弹
  createBullet: function () {
    var last, timer, threshhold = CONFIG.bulletDelay;
    //这里的处理时为了防止 一直按着发射子弹键，子弹连续发射
    return function () {
      var opts = {
        width: 1,
        height: 10,
        x: this.plane.x + (this.plane.width / 2),
        y: this.plane.y,
        size: Bullet.prototype.bulletSize,
        speed: Bullet.prototype.bulletSpeed
      };
      var self = this;
      var now = +new Date();
      if (last && now < last + threshhold) {
        clearTimeout(timer);
        timer = setTimeout(function () {
          last = now;
          self.bullets.push(new Bullet(opts));
        }, threshhold);
      } else {
        last = now;
        self.bullets.push(new Bullet(opts));
      }
    }

  }(),

  //绑定相关事件
  bindEvent: function () {
    var self = this;
    var playBtn = document.querySelector('.js-play');
    // 开始游戏按钮绑定
    playBtn.onclick = function () {
      self.play();
    };

    var replayBtns = document.querySelectorAll('.js-replay');
    replayBtns.forEach(function (el) {
      el.onclick = function () {
        self.replay();
      }
    });
    var nextBtn = document.querySelector('.js-next');
    nextBtn.onclick = function () {
      self.next();
    };
    document.onkeydown = function (e) {
      // 获取被按下的键值 (兼容写法)
      var key = e.keyCode || e.which || e.charCode;
      switch (key) {

        // 点击左方向键: 飞机向左移动
        case 37:
          self.plane.move('left');
          break;
        // 点击上方向键： 飞机射击
        case 38:
          self.createBullet.bind(self)();
          break;
        // 点击右方向键： 飞机向右移动
        case 39:
          self.plane.move('right');
          break;
        // 点击下方向键： 暂停游戏
        case 40:
          self.pause();
          break;
      }
    };
  },

  //重新开始
  replay: function () {
    CONFIG.level = 1;//等级
    this.fraction = 0;//积分
    this.crateFlyers(CONFIG);//重新初始化飞行物
    this.setStatus('playing');
  },

  //下一关
  next: function () {
    CONFIG.level++;
    this.crateFlyers(CONFIG);
    //this.play();
    this.setStatus('playing');
  },
  /**
   * 更新游戏状态，分别有以下几种状态：
   * start  游戏前
   * playing 游戏中
   * failed 游戏失败
   * success 游戏成功
   * all-success 游戏通过
   * stop 游戏暂停（可选）
   */
  setStatus: function (status) {

    this.status = status;
    container.setAttribute("data-status", status);

  },
  play: function () {
    this.setStatus('playing');
    this.animate();
  },

  start: function () {
    this.setStatus('start');
  },
  playing: function () {
    this.setStatus('playing');
  },
  failed: function () {
    this.setStatus('failed');
    document.querySelector('.score').innerHTML = this.fraction;
  },
  success: function () {
    this.setStatus('success');
  },
  allSuccess: function () {
    this.setStatus('all-success');
  },
  stop: function () {
    this.setStatus('stop');
  },
  //暂停
  pause: function () {
    if (this.status == 'pause' || this.status == 'playing') {
      this.setStatus(this.status == 'pause' ? 'playing' : 'pause');
    }
  },
  //动画刷新界面
  animate: function () {
    this.clearCanvas();
    if (!this.enemys.length) {
      if (CONFIG.level == CONFIG.totalLevel) {
        this.allSuccess();
      } else {
        this.success();
      }
    }
    if (this.status == 'playing') {//只有在‘游戏中’的状态，才去移动与重绘
      this.moving();
      this.draw();//之前老师的评价中，说没有清空界面，其实是清空界面之后又重绘了
    }
    requestAnimationFrame(this.animate.bind(this));//这个地方要注意 一定要bind(this)
  }
};


// 初始化
GAME.init(CONFIG);
//GAME.play();
