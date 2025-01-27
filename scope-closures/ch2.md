# 你并不了解 JavaScript：作用域与闭包 - 第二版

# 第二章：图解作用域词法

在第 1 章中，我们探讨了在代码编译过程中如何确定作用域，这种模式被称为「词法作用域」。术语「词法」指的是编译的第一阶段（词法/解析）。

要对我们的程序进行正确的*推理*，就必须对作用域的工作原理有一个坚实的概念基础。如果我们依靠猜测和直觉，我们可能会在某些时候意外地得到正确的答案，但在其他更多时候，我们的答案却大相径庭。这不是成功的秘诀。

就像在小学数学课上一样，如果我们不展示正确的步骤，仅得到正确的答案是不够的！我们需要建立准确而有用的心智模型，作为前进的基础。

本章将用几个比喻来说明*作用域*。目的是*思考* JS 引擎如何处理您的程序，使其更接近 JS 引擎的实际工作方式。

## 弹珠、水桶和气泡……哦，我的老伙计

在理解作用域方面，我发现一个有效的比喻，就是把彩色弹珠分类装进颜色相匹配的桶里。

想象一下，你拥有一堆弹珠，发现所有弹珠的颜色都是红色、蓝色或绿色。让我们把所有弹珠分类，红色的扔进红色桶，绿色的扔进绿色桶，蓝色的扔进蓝色桶。分类后，当你需要绿色弹珠时，你已经知道从绿色桶里取到它。

在这个比喻中，弹珠就是我们程序中的变量。桶则是作用域（函数和块），我们只是在概念上为它们指定了各自的颜色，以方便讨论。因此，每个弹珠的颜色取决于我们发现弹珠最初是在哪个*颜色*作用域中创建的。

让我们在注释中用颜色标签来定义第一章中的运行程序示例的作用域：

```js
// 外部/全局作用域：红色

var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" },
];

function getStudentName(studentID) {
    // 函数作用域：蓝色

    for (let student of students) {
        // 循环作用域：绿色

        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);
console.log(nextStudent); // Suzy
```

我们在代码注释中指定了三种作用域颜色：红色（最外层的全局作用域）、蓝色（函数 `getStudentName(..)` 的作用域）和绿色（`for` 循环的/内部作用域）。但在查看代码时，可能仍然很难识别这些作用域桶的边界具体是哪里。

图 2 通过在每个作用域周围绘制彩色气泡（又称水桶），帮助直观显示作用域的边界：

<figure>
    <img src="./images/fig2.png" width="500" alt="Colored Scope Bubbles" align="center">
    <figcaption><em>图 2：彩色作用域气泡</em></figcaption>
</figure>

1. **气泡 1**（红色）包含全局作用域，其中有三个标识符/变量：`students` （第 1 行）、`getStudentName` （第 8 行）和 `nextStudent` （第 16 行）。
2. **气泡 2** (蓝色) 包括函数 `getStudentName(..)` （第 8 行）的作用域，该函数仅有一个标识符/变量：参数 `studentID` （第 8 行）。
3. **气泡 3**（绿色）包含 `for` 循环（第 9 行）的作用域，该循环只包含一个标识符/变量：`student` （第 9 行）。

| 注意：                                                                                                                                                            |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 从技术上讲，参数 `studentID` 并不完全在蓝色 (2) 的作用域中。我们将在附录 A 的「隐式作用域」中解开这个困惑。现在，把 `studentID` 标注为蓝色 (2) 的弹珠已经足够了。 |

作用域气泡是在编译过程中根据函数/作用域块的编写位置、内部嵌套等因素确定的。每个作用域气泡都完全包含在其父作用域气泡中即作用域永远不会部分地包含在两个不同的外层作用域中。

每个弹珠（变量/标识符）的颜色取决于它在哪个气泡（桶）中声明，而不是它可能被访问的作用域的颜色（例如，第 9 行的 `students` 和第 10 行的 `studentID`）。

| 注意：                                                                                                                                                                                                               |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 请记住，我们在第 1 章中说过 `id`、`name` 和 `log` 都是属性，而不是变量；换句话说，它们不是桶中的弹珠，因此它们不会根据我们在本书中讨论的任何规则着色。要了解如何处理此类属性访问，请参阅本系列的第三本书*对象与类*。 |

当 JS 引擎处理程序（在编译过程中）并找到一个变量的声明时，它基本上会问：「我当前处于哪个*颜色*的作用域（气泡或水桶）中？」变量被指定为相同的*颜色*，这意味着它属于该桶/气泡。

绿色 (3) 桶完全嵌套在蓝色 (2) 桶内，同样，蓝色 (2) 桶也完全嵌套在红色 (1) 桶内。如图所示，作用域可以相互嵌套，嵌套深度可以根据程序需要而定。

如果在当前作用域或当前作用域之上/之外的任何作用域中有匹配的声明，则允许引用（非声明）变量/标识符，但不允许引用来自下层/嵌套作用域的声明。

红色 (1) 桶中的表达式只能使用红色 (1) 弹珠，**不能**使用蓝色 (2) 或绿色 (3)。蓝色 (2) 桶中的表达式可以引用蓝色 (2) 或红色 (1) 弹珠，**不能**使用绿色(3)。而绿色 (3) 桶中的表达式可以访问红色 (1)、蓝色 (2) 和绿色 (3) 弹珠。

我们可以把在运行时确定这些未声明弹珠颜色的过程概念化为查找。由于第 9 行的 `for` 循环语句中的 `students` 变量引用不是一个声明，所以它没有颜色。因此我们询问当前蓝色 (2) 作用域桶是否有与该名称匹配的弹珠。既然没有，那么就继续查找下一个外层/包含的作用域：红色 (1)。红色 (1) 桶有一个名称为 `students` 的弹珠，因此循环语句的 `students` 变量引用被确定为一个红色 (1) 弹珠。

第 10 行的 `if (student.id == studentID)` 语句同样被确定为引用名为 `student` 的绿色 (3) 弹珠和 `studentID` 的蓝色 (2) 弹珠。

| 注意：                                                                                                                                                                                                                                                                                     |
| :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| JS 引擎通常不会在运行时确定这些弹珠的颜色；这里的「查找」只是一种修辞手法，目的是帮助您理解这些概念。在编译过程中，大多数或所有变量引用都会匹配已知的作用域桶，因此它们的颜色已经确定，并与每个弹珠引用一起存储，以避免程序运行时不必要的查找。有关这一细微差别的更多信息，请参见第 3 章。 |

从弹珠和水桶（还有气泡！）中获得的主要启示：

-   变量是在特定作用域中声明的，可以将其视为来自匹配颜色桶的彩色弹珠。
-   任何变量引用，如果出现在它被声明的作用域中，或出现在任何更深的嵌套作用域中，都会被标记为相同颜色的弹珠，除非中间的作用域「遮蔽」了变量声明；请参阅第 3 章中的「遮蔽」。
-   在编译过程中，会确定颜色桶及其包含的弹珠。在代码执行过程中，这些信息将用于变量（弹珠颜色）的「查找」。

## 朋友之间的对话

在分析变量及其作用域的过程中，另一个有用的比喻是想象代码在处理和执行过程中在引擎内部发生的各种对话。我们可以「监听」这些对话，从而更好地从概念上理解作用域是如何工作的。

现在让我们来认识一下 JS 引擎的成员，他们在处理我们的程序时会进行对话：

-   _引擎_：负责从头到尾编译和执行 JavaScript 程序。
-   _编译器_：*引擎*的朋友之一；处理所有解析和代码生成的脏活累活（见上一节）。
-   _作用域管理器_：*引擎*的另一个朋友；收集并维护所有已声明变量/标识符的查找列表，并执行一系列规则，规定当前执行代码如何访问这些变量/标识符。

    要想*完全理解* JavaScript 的工作原理，你需要开始像*引擎*（和朋友们）那样思考，提出他们提出的问题，并同样回答他们的问题。

    为了探讨这些对话，请再次回顾我们正在运行的程序示例：

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" },
];

function getStudentName(studentID) {
    for (let student of students) {
        if (student.id == studentID) {
            return student.name;
        }
    }
}

var nextStudent = getStudentName(73);

console.log(nextStudent);
// Suzy
```

让我们来看看 JS 将如何处理该程序，特别是从第一条语句开始。数组及其内容只是基本的 JS 值字面形式（因此不受任何作用域问题的影响），所以我们在这里的重点是 `var students = [ .. ]` 声明和初始化赋值部分。

我们通常将其视为一条语句，但我们的朋友*引擎*并不这么看。事实上，JS 将这些操作视为两个不同的操作，一个由*编译器*在编译时处理，另一个由*引擎*在执行时处理。

*编译器*要做的第一件事就是进行词法处理，将程序分解为词块，然后将其解析为一棵树 (AST)。

一旦*编译器*进入代码生成阶段，需要考虑的细节可能比看到的要多。一个合理的假设是，*编译器*将为第一条语句生成代码，例如「为一个变量分配内存，给它贴上 `students` 的标签，然后将数组的引用插入该变量」。但这并不是故事的全部。

下面是*编译器*处理该语句的步骤：

1. 遇到 `var students` 时，*编译器*会询问*作用域管理器*看看该特定作用域桶是否已经存在名为 `students` 的变量。如果是，*编译器*将忽略此声明并继续。否则，*编译器*将生成代码，（在执行时）要求*作用域管理器*在该作用域桶中创建一个名为 `students` 的新变量。
2. 然后，*编译器*会生成供*引擎*稍后执行的代码，以处理 `students = []` 赋值。*引擎*运行的代码将首先询问*作用域管理器*在当前作用域桶中是否存在可访问的名为 `students` 的变量。如果没有，*引擎*就会继续查找其他地方（请参阅下面的「嵌套作用域」）。一旦*引擎*找到一个变量，它就会将数组 `[ .. ]` 的引用赋给它。

以对话的形式来看，程序编译的第一阶段可以在*编译器*和*作用域管理器*之间这样进行：

> **_编译器_**：嘿，_作用域管理器_（全局作用域），我发现了一个名为 `students` 的标识符的正式声明，听说过吗？

> **_（全局） 作用域管理器_**：没听说过，所以我就为你创建了它。

> **_编译器_**：嘿，_作用域管理器_，我找到了一个名为 `getStudentName` 的标识符的正式声明，听说过吗？

> **_（全局） 作用域管理器_**：没有，但我刚刚为你创建了它。

> **_编译器_**：嘿，_作用域管理器_，`getStudentName` 指向一个函数，所以我们需要一个新的作用域桶。

> **_（函数） 作用域管理器_**：知道了，这是作用域桶。

> **_编译器_**：嘿，_作用域管理器_（函数的管理器），我找到了 `studentID` 的正式参数声明，听说过吗？

> **_（函数） 作用域管理器_**：没有，但现在它是在这个作用域内创建的。

> **_编译器_**：嘿，_作用域管理器_（函数的管理器），我发现一个 `for` 循环需要它自己的作用域桶。

> ...

对话是一种问答式的交流，**编译器**会询问当前的*作用域管理器*是否已经遇到过所遇到的标识符声明。如果回答「否」，*作用域管理器*就会在该作用域中创建该变量。如果答案是「是」，那么实际上就跳过了，因为不需要该*作用域管理器*做什么了。

*编译器*在运行到函数或块作用域时也会发出信号，以便实例化新的作用域桶和*作用域管理器*。

之后，在执行程序时，对话将转移到*引擎*和*作用域管理器*上，可能会这样进行：

> **_引擎_**：嘿，_作用域管理器_（全局作用域），在我们开始之前，你能否查找标识符 `getStudentName` 以便我将此函数赋给它？

> **_（全局） 作用域管理器_**：好的，这个变量给你。

> **_引擎_**：嘿，_作用域管理器_，我找到了 `students` 的*目标*参考，听说过吗？

> **_（全局） 作用域管理器_**：是的，它是在这一作用域定义的，给你。

> **_引擎_**：谢谢，我将 `students` 初始化为 `undefined`，这样就可以使用了。

> 嘿，_作用域管理器_（全局作用域），我找到了`nextStudent` 的*目标*引用，听说过吗？

> **_（全局） 作用域管理器_**：是的，它是在这一作用域定义的，给你。

> **_引擎_**：谢谢，我将 `nextStudent` 初始化为 `undefined`，这样就可以使用了。

> 嘿，_作用域管理器_（全局作用域），我找到了`getStudentName` 的*源*引用，听说过吗？

> **_（全局） 作用域管理器_**：是的，它是在这一作用域定义的，给你。

> **_引擎_**：很好，`getStudentName` 中的值是一个函数，所以我要执行它。

> **_引擎_**：嘿，_作用域管理器_，现在我们需要实例化函数的作用域。

> ...

这次对话又是一次问答式交流，*引擎*首先要求当前的*作用域管理器*查找被提升的 `getStudentName` 标识符，以便将函数与之关联。然后，*引擎*继续询问*作用域管理器*有关 `students` 的*目标*引用，以此类推。

回顾并总结一下类似 `var students = [ .. ]` 这样的语句是如何处理的，分为两个不同的步骤：

1. *编译器*会设置作用域变量的声明（因为它之前没有在当前作用域中声明）。

2. 当*引擎*执行时，为了处理语句中的赋值部分，*引擎*会要求*作用域管理器*查找变量，将其初始化为 `undefined` 以便随时使用，然后将数组值赋值给它。

## 作用域嵌套

当执行 `getStudentName()` 函数时，*引擎*会为该函数的作用域请求一个*作用域管理器*实例，然后它将继续查找参数（`studentID`），并将 `73` 参数值赋给该参数，依此类推。

`getStudentName(..)` 的函数作用域嵌套在全局作用域中。`for` 循环的块作用域同样嵌套在该函数作用域内。作用域可以按照程序定义的任意深度进行词法嵌套。

每次执行作用域（一次或多次）时，每个作用域都会获得自己的*作用域管理器*实例。每个作用域在开始执行时都会自动注册其所有标识符（这称为「变量提升」；请参阅第 5 章）。

在作用域开始时，如果任何标识符来自一个 `function` 声明，该变量会被自动初始化为其关联的函数引用。如果任何标识符来自 `var` 声明（而不是 `let`/`const` 声明），该变量会被自动初始化为 `undefined` 以便可以使用；否则，该变量将保持未初始化状态（又称 "TDZ"，参见第 5 章），在执行完整的声明和初始化之前不能使用。

在 `for (let student of students) {` 语句中，`students` 是一个必须查找的*源*引用。但由于函数的作用域找不到这样的标识符，如何处理这种查找呢？

为了解释清楚，让我们想象一下这样的对话：

> **_引擎_**：嘿，_作用域管理器_（用于函数），我有一个关于 `students` 的*源*引用，听说过吗？

> **_（函数） 作用域管理器_**：没听说过。试试下一个外部作用域。

> **_引擎_**：嘿，_作用域管理器_（用于全局作用域），我有一个 `students` 的*源*引用，听说过吗？

> **_（全局） 作用域管理器_**：是的，它是在这一作用域定义的，给你。

> ...

词法作用域的一个重要方面是，如果在当前作用域中找不到标识符引用，就会查询嵌套中的下一个外层作用域；这个过程会一直重复，直到找到答案或没有更多的作用域可查询为止。

### 查找失败

当*引擎*用尽所有*词法可用*作用域（向外移动）仍无法解决标识符的查找问题时，就会出现错误条件。不过，根据程序的模式（严格模式或非严格模式）和变量的作用（即*目标*与*源*；参见第 1 章），这种错误条件会有不同的处理方式。

#### 混乱的 Undefined

如果变量是*源*，则未解决的标识符查找会被视为未声明（未知、缺失）变量，总是会导致抛出 `ReferenceError` 。此外，如果变量是*目标*，且代码当时正在严格模式下运行，则该变量会被视为未声明变量，同样会引发 `ReferenceError`。

在大多数 JS 环境中，未声明变量条件的错误信息类似于 "Reference Error: XYZ is not defined"。就英语而言，「未定义 (not defined)」与 "undefined" 几乎完全相同。但在 JS 中，这两个词却截然不同，不幸的是，这条错误信息造成了长期的混淆。

「未定义 (not defined)」的真正意思是「标识符被定义但缺少说明 (not declared)」，或者更确切地说，是「未声明 (undeclared)」，就像一个变量在任何*词法可用*作用域中都没有匹配的正式声明一样。相比之下，"undefined" 的真正含义是找到了一个变量（已声明），但该变量目前没有其他值，所以它的值默认为 `undefined`。

为了进一步加深混淆，JS 的 `typeof` 运算符会为两种状态下的变量引用返回字符串 `"undefined"`：

```js
var studentName;
typeof studentName; // "undefined"

typeof doesntExist; // "undefined"
```

这两个变量引用的条件截然不同，但 JS 确实把水搅浑了。术语混乱令人困惑，也非常不幸。不幸的是，JS 开发人员必须密切关注，以免混淆他们正在处理的*哪种*「未定义」！

#### 全局... 什么!?

如果该变量是一个*目标*变量，并且严格模式没有生效，那么就会出现一种令人困惑和惊讶的遗留行为。麻烦的结果是，全局作用域的*作用域管理器*会创建一个**意外的全局变量**来完成目标赋值！

思考一下：

```js
function getStudentName() {
    // 赋值给未声明的变量 :(
    nextStudent = "Suzy";
}

getStudentName();

console.log(nextStudent);
// "Suzy" -- 哎呀，一个意外的全局变量!
```

下面是*对话*的过程：

> **_引擎_**：嘿，_作用域管理器_（用于函数），我有一个关于 `nextStudent` 的*目标*引用，听说过吗？

> **_（函数） 作用域管理器_**：没听说过。试试下一个外部作用域。

> **_引擎_**：嘿，_作用域管理器_（全局作用域），我有一个关于 `nextStudent` 的*目标*引用，听说过吗？

> **_（全局） 作用域管理器_**：没有，不过既然我们现在是非严格模式，我就帮你创建了一个全局变量，给你！

呸。

这种意外（几乎肯定最终会导致错误）是严格模式提供有益保护的一个很好的例子，也是为什么*不使用*严格模式是个坏主意的原因。在严格模式下，**_全局作用域管理器_**会作出如下响应：

> **_（全局） 作用域管理器_**：没听说过。对不起，我必须抛出一个 `ReferenceError`。

赋值给一个从未声明过的变量*是*一个错误，因此我们在这里收到一个 `ReferenceError` 是正确的。

切勿依赖意外的全局变量。始终使用严格模式，并正式声明变量。如果你错误地将变量赋值给一个未声明的变量，你会得到一个有用的 `ReferenceError`。

### 建立在隐喻之上

为了使嵌套的作用域解析可视化，我更喜欢另一个比喻：办公楼，如图 3 所示：

<figure>
    <img src="./images/fig3.png" width="250" alt="Scope &quot;Building&quot;" align="center">
    <figcaption><em>图 3：作用域「建筑」</em></figcaption>
    <br><br>
</figure>

大楼代表我们程序的嵌套作用域集合。大楼的第一层代表当前执行的作用域。大楼的顶层是全局作用域。

要解析一个*目标*或*源*变量引用，首先要在当前楼层查找，如果找不到，就乘电梯到下一层（即外层作用域），在那里查找，然后再到下一层，依此类推。一旦到达顶层（全局作用域），要么找到要找的东西，要么找不到。但不管怎样，你都必须停下来。

## 未完待续

到目前为止，您应该可以建立更丰富的心智模型，了解什么是作用域，以及 JS 引擎如何从您的代码中确定和使用作用域。

在*继续*之前，请在你的某个项目中找到一些代码，然后进行这些对话。真的，要大声说出来。找一个朋友，和他们一起练习每个角色。如果你们中的任何一个人发现自己感到困惑或被绊倒了，请花更多时间复习这些资料。

当我们移动（向上）到下（外）一章时，我们将探索程序的词法作用域是如何以链条形式连接起来的。
