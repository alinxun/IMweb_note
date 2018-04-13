//具体的叫实例，抽象的叫对象

// 工厂模式
function createBottle(name,price,isKeepWarn){
    return {
        name:name,
        price:price,
        isKeepWarn:isKeepWarn
    };
}
var bottle1 = createBottle('太空杯',49,false);

//函数 
//内部：arguments this
//属性：name length prototype 
//方法： bind()   call()  apply()

// arguments 对象类数组  length 属性
//影响代码可读性，适合动态参数场景
function add(){
    var sum = 0;
    var len = arguments.length;
    var i =0;
    if(len){
        for(;i<len;i++){
            sum += arguments[i];
        }
    }
    return sum;
}

//this   执行环境

dom.addEventListener('click',function(){
    console.log(this);//dom
},false);

window.name = 'linxun';
var o = {name:'haha'};
function sayName(){console.log(this.name)}

o.sayName = sayName.bind(window);
sayName.call(o,1,2);
sayName.apply(o,[1,2]);//apply 第二个参数数组

//函数的属性
var add = function(){}
add.name //'name'
add.length //0 arguments.length
add.prototype  //对象  ， 实现继承的重要属性

//一等公民：可以作为函数的参数和返回值，也可以赋值给变量
//second class: 可以作为函数的参数，但不能从函数返回，也不能赋值给变量
//third class: 不能作为函数的参数

//闭包： 一个有权访问一个函数作用域中变量的函数
//带有数据的函数


//构造函数  
var obj = new Object();//原生构造函数
console.log(obj instanceof Object);

function Bottle(name, price, isKeepWarn){
    this.name = name;
    this.price = price;
    this.isKeepWarn = isKeepWarn;
}
var bottle1 = new Bottle('杯子',59,true);
console.log(bottle instanceof Bottle);

//使用构造函数创建类
//原型时函数的一个属性，是一个对象
Object.prototype.constructor === Object;

//原型的缺陷： 共享数据缺陷， 会影响数据

//构造函数，独享数据： 

//构造函数结合原型

//属性的判断 in（实例，原型） hasOwnProperty(实例)

//继承
//使子类具有父类的属性和方法，而不需要重新编写相同的代码

//原型链继承
//子类 -> 实例中找不到的属性和方法 -> 去原型找 -> 指向父类实例 -> 具备父类的属性和方法

function Plane(color){
    this.color=color;
}
Plane.prototype.fly = function(){
    console.log('flying');
};
function Fighter(){
    this.bullets = [];
}
Fighter.prototype = new Plane('blue');//打通原型链---指向父类实例
Fighter.prototype.shoot = function(){
    console.log('biubiu');
}
var fighter1 = new Fighter();

//原型链继承的不足： constructor 指向  属性共享 参数

//借用构造函数  --  组合继承
function Plane(color){
    this.color = color;
    this.sayHello = function(){}
}
Plane.prototype.fly = function(){
    //原型链上的方法不能继承，所以借用构造函数不能单独使用    -- 组合继承
}
function Fighter(color){
    Plane.call(Plane,color);
    this.bullets = [];  
}
Fighter.prototype = new Plane();//打通原型链
Fighter.prototype.shoot = function(){};
var fighter1 = new Fighter('blue');



//组合继承
function Plane(color){
    this.color = color;
    this.sayHello = function(){};
}
Plane.prototype.fly = function(){};

function Fighter(color){
    Plane.call(this,color);//借用构造函数继承实例属性
    this.bullets = [];
}
Fighter.prototype = new Plane();//继承原型的属性和方法
Fighter.prototype.constructor = Fighter;//纠正constructor
Fighter.prototype.shoot = function(){};
var fighter1 = new Fighter('blue');

//组合继承的缺陷： 两次调用构造函数， 属性冗余（原型指向实例上的属性总是壁覆盖）


//最佳实践
function inheritPrototype(subType, superType){
    var protoType = Object.create(superType.prototype);
    protoType.constructor = subType;//重置constructor
    subType.prototype = protoType;//修改子类原型
    /**
     * var temp = function(){};
     * temp.prototype = superType.prototype
     * subType.prototype = new temp();
     * subType.prototype.sonstructor = subType;
     * 
     */
}

function Plane(color){
    this.color = color;
    this.sayHello = function(){}
}
Plane.prototype.fly = function(){};

function Fighter(color){
    Plane.call(this,color);
    this.bullets = [];
}
inheritPrototype(Fighter,Plane);
Fighter.prototype.shoot = function(){

}

var fighter1 = new Fighter('blue');

