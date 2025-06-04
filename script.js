const mealData = [
    { name: "16食堂2楼", weight: 3, type: "normal" },
    { name: "16食堂3楼麻辣烫", weight: 3, type: "normal" },
    { name: "16食堂3楼鸭血粉丝", weight: 3, type: "normal" }, // 新增
    { name: "16食堂3楼盖浇饭", weight: 3, type: "normal" },
    { name: "16食堂3楼炒饭", weight: 3, type: "normal" },
    { name: "16食堂3楼肉夹馍", weight: 3, type: "normal" },
    { name: "16食堂3楼馄饨", weight: 3, type: "normal" },
    { name: "16食堂3楼鸡腿饭", weight: 3, type: "normal" },
    { name: "16食堂3楼汉堡", weight: 3, type: "normal" },
    { name: "17食堂1食堂面", weight: 3, type: "normal" },
    { name: "17食堂1食堂黄焖鸡", weight: 3, type: "normal" },
    { name: "17食堂2食堂猪脚饭", weight: 3, type: "normal" },
    { name: "17食堂2食堂鱼粉", weight: 3, type: "normal" },
    { name: "17食堂2食堂饺子", weight: 3, type: "normal" },
    { name: "17食堂2食堂砂锅菜", weight: 3, type: "normal" }, // 新增
    { name: "外卖", weight: 2, type: "low_prob" },         // 权重更新
    { name: "星悦里", weight: 1, type: "low_prob" },
    { name: "东渚", weight: 1, type: "low_prob" }
];

let selectedPreviousMeal = null;

document.addEventListener('DOMContentLoaded', () => {
    renderPreviousMealButtons();

    const pickButton = document.getElementById('pickMealButton');
    pickButton.addEventListener('click', handlePickMeal);

    const clearButton = document.getElementById('clearPreviousMealButton');
    clearButton.addEventListener('click', clearPreviousMealSelection);

    updateCurrentPreviousMealDisplay(); // Initialize display
});

function renderPreviousMealButtons() {
    const container = document.getElementById('previousMealButtons');
    container.innerHTML = ''; // Clear existing buttons

    mealData.forEach(meal => {
        const button = document.createElement('button');
        button.textContent = meal.name;
        button.classList.add('meal-button');
        if (meal.type === 'low_prob') {
            button.classList.add('low-probability');
        }
        button.addEventListener('click', () => {
            // Deselect previously selected button
            const currentlySelected = container.querySelector('.meal-button.selected');
            if (currentlySelected) {
                currentlySelected.classList.remove('selected');
            }

            // Select new button
            button.classList.add('selected');
            selectedPreviousMeal = meal.name;
            updateCurrentPreviousMealDisplay();
        });
        container.appendChild(button);
    });
}

function updateCurrentPreviousMealDisplay() {
    document.getElementById('currentPreviousMeal').textContent = selectedPreviousMeal ? selectedPreviousMeal : '无';
}

function clearPreviousMealSelection() {
    selectedPreviousMeal = null;
    const buttons = document.querySelectorAll('#previousMealButtons .meal-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    updateCurrentPreviousMealDisplay();
    document.getElementById('result').innerHTML = ''; // Clear previous result
}

function chooseMealLogic(previousMealToExclude) {
    let currentOptions = JSON.parse(JSON.stringify(mealData)); // Deep copy
    let exclusionMessage = "";

    if (previousMealToExclude) {
        const initialLength = currentOptions.length;
        currentOptions = currentOptions.filter(option => option.name !== previousMealToExclude);
        if (currentOptions.length < initialLength) {
            exclusionMessage = `(已排除上一顿的选择：${previousMealToExclude})`;
        }
    }

    if (currentOptions.length === 0) {
        if (previousMealToExclude && mealData.some(m => m.name === previousMealToExclude)) {
            return { chosenMeal: `哎呀，除了 ${previousMealToExclude} 好像没别的可选了，要不就再吃一次？或者今天想点特别的？`, exclusionMessage };
        } else {
            return { chosenMeal: "选项列表是空的，没法选啦！", exclusionMessage };
        }
    }

    let totalWeight = 0;
    currentOptions.forEach(option => {
        totalWeight += option.weight;
    });

    if (totalWeight === 0) {
        if (currentOptions.length > 0) {
            const randomIndex = Math.floor(Math.random() * currentOptions.length);
            return { chosenMeal: currentOptions[randomIndex].name, exclusionMessage: exclusionMessage + " (注意: 剩余选项权重为0，已进行普通随机选择)" };
        } else {
            return { chosenMeal: "没有可供选择的食物了。", exclusionMessage };
        }
    }

    let randomNumber = Math.random() * totalWeight;
    let chosenMealName = null;

    for (let i = 0; i < currentOptions.length; i++) {
        if (randomNumber < currentOptions[i].weight) {
            chosenMealName = currentOptions[i].name;
            break;
        }
        randomNumber -= currentOptions[i].weight;
    }

    if (!chosenMealName && currentOptions.length > 0) {
        chosenMealName = currentOptions[0].name;
    }

    return { chosenMeal: chosenMealName, exclusionMessage };
}

function handlePickMeal() {
    const { chosenMeal, exclusionMessage } = chooseMealLogic(selectedPreviousMeal);
    const resultDiv = document.getElementById('result');

    if (chosenMeal) {
        resultDiv.innerHTML = `<h2>今天就吃：${chosenMeal} 🍜</h2>`;
        if (exclusionMessage) {
            const p = document.createElement('p');
            p.textContent = exclusionMessage;
            resultDiv.appendChild(p);
        }
    } else {
        resultDiv.innerHTML = `<h2>出错了，没选到吃的！</h2>`;
    }
}