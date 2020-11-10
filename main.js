/* jshint curly:true, debug:true */
/* globals $, firebase */

/**
 * -------------------------
 * 期限入力フォームのデフォルト表示設定
 * -------------------------
 */
 
const date = new Date();
const yyyy = date.getFullYear();
const mm = ("0" + (date.getMonth() + 1)).slice(-2);
const dd = ("0" + date.getDate()).slice(-2);
  
document.getElementById("today").value = yyyy +'-'+mm+'-'+dd;


/**
 * -------------------------
 * タスク登録処理
 * -------------------------
 */
 
const resetForm = () => {
  $('#task-form')[0].reset();
  document.getElementById("today").value = yyyy +'-'+mm+'-'+dd;
  $('#add-task-button')
    .prop('disabled',false);
};
 
// タスクの登録処理
$('#task-form').on('submit', (e) => {
  e.preventDefault();
  
  // タスク追加ボタンを押せなくする
  $('#add-task-button')
    .prop('disabled', true);
   
  // タスクの内容
  const taskContent = $('#task-content').val();
  
  // 優先度
  const taskPriority = $('input[name="priority"]:checked').val();
  
  // 期限の値
  const taskLimit = $('#today').val();
  
  // タスクデータ
  const taskData = {
    taskContent,
    taskPriority,
    taskLimit,
  };
  
  firebase
    .database()
    .ref('tasks')
    .push(taskData)
    .then(() => {
      resetForm();
    })
    .catch((error) => {
      console.error('エラー', error);
      resetForm();
    });
 });
 
 
/**
 * -------------------------
 * タスク一覧への表示
 * -------------------------
 */
 
const deleteTask = (taskId) => {
  if(window.confirm('削除してもよろしいですか？')){
    return firebase
      .database()
      .ref(`tasks/${taskId}`)
      .remove();
  } else {
    return;
  }
};

// タスク表示用のdivを複製して表示する
const createTaskDiv = (taskId, taskData) => {
  const $divTag = $('#task-template > .task-item').clone(true);
  
  // タスクの内容を表示する
  $divTag.find('.task-header').text(taskData.taskContent);
  
  // タスクの優先度を表示する
  $divTag.find('.priority-value').text(taskData.taskPriority);
  
  // タスクの期限を表示する
  $divTag.find('.limit-value').text(taskData.taskLimit);
  
  // id属性をセット
  $divTag.attr('id', `task-id-${taskId}`);
  
  // 削除ボタンのイベントハンドラを登録
  const $deleteButton = $divTag.find('.delete-button');
  $deleteButton.on('click', () => {
    deleteTask(taskId);
  });
  return $divTag;
};

// タスク一覧内の表示をクリア
const resetTaskList = () => {
  $('#task-list').empty();
};

// タスク一覧にタスクを表示する
const addTask = (taskId, taskData) => {
  const $divTag = createTaskDiv(taskId, taskData);
  $divTag.appendTo('#task-list');
};

// タスク一覧の初期化、イベントハンドラ登録処理
const loadTaskListView = () => {
  resetTaskList();
  
  // タスクデータを取得
  const tasksRef = firebase
  .database()
  .ref('tasks')
  .orderByChild('createdAt');
  
  // 過去に登録したイベントハンドラを削除
  tasksRef.off('child_removed');
  tasksRef.off('child_added');
  
  // タスクデータが削除されたときの処理
  tasksRef.on('child_removed', (taskSnapshot) => {
    const taskId = taskSnapshot.key;
    const $task = $(`#task-id-${taskId}`);
    
    $task.remove();
  });
  
  // タスクデータが追加されたときの処理
  tasksRef.on('child_added', (taskSnapshot) => {
    const taskId = taskSnapshot.key;
    const taskData = taskSnapshot.val();
    
    addTask(taskId, taskData);
  });
};

window.onload = function() {
  loadTaskListView();
};
