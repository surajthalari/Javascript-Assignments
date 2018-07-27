var addedTagArray = []
var taskDetailsArray = []
var editVariable = 0
var editObject = -1
var reloadID = 1
var flagJSONSave = 0
// var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest
// Deletes the complete table except the first index row.
// used while updating the table as we generate the whole
// table ehen we add a row.
function deleteTable () {
  var getTable = document.getElementById('table')
  getTable.getElementsByTagName('tbody')[0].innerHTML = getTable.rows[0].innerHTML
}
window.onload = onLoad()
// Is called while the body of the html is loaded
// as to keep track the added elements in JSON Server
function onLoad () {
  if (window.performance.navigation.type === 1) {
    var xhttp = new XMLHttpRequest()
    xhttp.open('GET', 'http://localhost:3000/objects', true)
    xhttp.onload = function () {
      var tasks = JSON.parse(xhttp.responseText)
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        taskDetailsArray = tasks
        taskDetailsArray.sort(function (a, b) {
          var keyA = new Date(a.id)
          var keyB = new Date(b.id)
          //  Compare the 2 dates
          if (keyA < keyB) return -1
          if (keyA > keyB) return 1
          return 0
        })
        reloadID = taskDetailsArray[taskDetailsArray.length - 1].id + 1
        calculations()
        displayTasks()
      }
    }
    xhttp.send(null)
  }
}

// Stores the added row into the JSON Server.
// Row Object is converted into JSON Object before Sending
function saveTaskJSON () {
  var xhttp = new XMLHttpRequest()
  xhttp.open('POST', 'http://localhost:3000/objects', true)
  xhttp.setRequestHeader('Content-type', 'application/json')
  xhttp.send(JSON.stringify(taskDetailsArray[taskDetailsArray.length - 1]))
}

// Add tags to the div element which is below the input tag element.

function addTag () {
  var enteredTag = document.getElementById('tag').value
  if (enteredTag !== '' && enteredTag.trim() !== '') {
    var tagBelow = document.getElementById('tagDivId')
    var addTagSpan = document.createElement('SPAN')
    addTagSpan.id = 'id:' + addedTagArray.length
    var addedTag = document.createTextNode(enteredTag)
    addTagSpan.appendChild(addedTag)
    var spaceOne = document.createElement('SPAN')
    var spaceOneValue = document.createTextNode(' ')
    spaceOne.appendChild(spaceOneValue)
    addTagSpan.appendChild(spaceOne)
    var crossMark = document.createElement('SPAN')
    var crossMarkValue = document.createTextNode('X')
    crossMark.appendChild(crossMarkValue)
    crossMark.style.fontSize = 'bold'
    crossMark.style.color = 'blue'
    crossMark.style.textDecoration
    addTagSpan.appendChild(crossMark)
    var spaceTwo = document.createElement('SPAN')
    var spaceTwoValue = document.createTextNode(' ')
    spaceTwo.appendChild(spaceTwoValue)
    addTagSpan.appendChild(spaceTwo)
    tagBelow.appendChild(addTagSpan)
    crossMark.onclick = function () {
      deleteTag(addTagSpan.id)
    }
    addedTagArray.push(enteredTag)
    document.getElementById('tag').value = ''
  }
}

// Deletes the tag when you click on.
// the cross mark on the div element which is below
// the input tag element
function deleteTag (deleteTagVariable) {
  var crossSpanToDelete = document.getElementById(deleteTagVariable)
  var tagString = crossSpanToDelete.innerText.slice(0, -2)
  for (var index = 0; index < addedTagArray.length; index++) {
    if (tagString === addedTagArray[index]) {
      delete addedTagArray[index]
    }
  }
  addedTagArray = addedTagArray.filter(function (element) {
    return element !== undefined
  })
  crossSpanToDelete.parentNode.removeChild(crossSpanToDelete)
}

// Is invoked when the save button is clicked.
// this saves the task details in the table.
function saveFormMethod () {
  if (editVariable) {
    updateTask()
  } else {
    var taskDetail = {}
    if (document.getElementById('taskv').value !== '' && document.getElementById('taskv').value.trim() !== '') {
      taskDetail.id = reloadID
      reloadID++
      taskDetail.taskValue = document.getElementById('taskv').value.trim()
      taskDetail.selectValue = document.getElementById('sel').value
      addedTagArray = addedTagArray.filter(function (element) {
        return element !== undefined
      })
      taskDetail.tagValue = addedTagArray
      if (addedTagArray.length !== 0) {
        addedTagArray = addedTagArray.filter(function (element) {
          return element !== undefined
        })
        taskDetail.tagValue = addedTagArray
      } else {
        taskDetail.tagValue = '-'
      }
      addedTagArray = []
      taskDetailsArray.push(taskDetail)
      if (flagJSONSave === 0) { saveTaskJSON() }
      flagJSONSave = 0
      document.getElementById('formid').reset()
      document.getElementById('tagDivId').innerHTML = ''
    } else {
      window.alert('Enter Task')
    }
  }
  if (!document.getElementById('checkSearch').checked) {
    displayTasks()
  } else {
    showPending()
  }
  calculations()
  return false
}

// Builds the table with all the provided
// row values.
function addRowsToTable (arrayContainigRowIDs) {
  for (var index = 0; index < arrayContainigRowIDs.length; index++) {
    var row = document.getElementById('table').insertRow()
    row.id = arrayContainigRowIDs[index]
    var cellProgressCheckbox = row.insertCell(0)
    var cellTaskName = row.insertCell(1)
    var cellTag = row.insertCell(2)
    var cellProgressValue = row.insertCell(3)
    var cellEditDelete = row.insertCell(4)
    cellTaskName.innerHTML = taskDetailsArray[arrayContainigRowIDs[index]].taskValue
    cellTag.innerHTML = taskDetailsArray[arrayContainigRowIDs[index]].tagValue
    cellProgressValue.innerHTML = taskDetailsArray[arrayContainigRowIDs[index]].selectValue
    var checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.onclick = function () {
      invertPendingCompleted(this.parentNode.parentNode.id)
    }
    if (taskDetailsArray[arrayContainigRowIDs[index]].selectValue === 'pending') {
      checkbox.checked = false
    } else {
      checkbox.checked = true
    }
    cellProgressCheckbox.appendChild(checkbox)
    var editButton = document.createElement('BUTTON')
    editButton.onclick = function () {
      editTask(this.parentNode.parentNode.id)
    }
    var editButtonText = document.createTextNode('EDIT')
    editButton.appendChild(editButtonText)
    editButton.style.marginRight = '1.5cm'
    editButton.style.marginLeft = '1.5cm'
    cellEditDelete.appendChild(editButton)
    var deleteButton = document.createElement('BUTTON')
    deleteButton.onclick = function () {
      deleteRowInTable(this.parentNode.parentNode.id)
      deleteEditManipulation(this.parentNode.parentNode.id)
    }
    var deleteButtonText = document.createTextNode('DELETE')
    deleteButton.appendChild(deleteButtonText)
    cellEditDelete.appendChild(deleteButton)
  }
}

// After populating the edit task in form and then .
// you delete the task,this method saves the populated task as .
// new task instead of updating .
function deleteEditManipulation (taskID) {
  if (editObject === taskID) {
    editVariable = 0
    flagJSONSave = 0
  }
}

// Displays the table by passing the array indexes to.
// the addRowsToTable method.
function displayTasks () {
  deleteTable()
  var duplicateArray = []
  for (var index = 0; index < taskDetailsArray.length; index++) {
    duplicateArray[index] = index
  }
  addRowsToTable(duplicateArray)
}

// Populates the task form with the values of
// the row in which edit is being clicked
function editTask (taskID) {
  document.getElementById('taskv').value = taskDetailsArray[taskID].taskValue
  taskDetailsArray[taskID].selectValue === 'pending' ? document.getElementById('sel').selectedIndex = 0 : document.getElementById('sel').selectedIndex = 1
  var editTaskDivId = document.getElementById('tagDivId')
  while (editTaskDivId.firstChild) {
    editTaskDivId.removeChild(editTaskDivId.firstChild)
  }
  addedTagArray = []
  for (var index = 0; index < taskDetailsArray[taskID].tagValue.length; index++) {
    var enteredTag = taskDetailsArray[taskID].tagValue[index]
    if (enteredTag !== '-' && enteredTag.trim() !== '') {
      var tagBelow = document.getElementById('tagDivId')
      var addTagSpan = document.createElement('SPAN')
      addTagSpan.id = 'id:' + addedTagArray.length
      var addedTag = document.createTextNode(enteredTag)
      addTagSpan.appendChild(addedTag)
      var spaceOne = document.createElement('SPAN')
      var spaceOneValue = document.createTextNode(' ')
      spaceOne.appendChild(spaceOneValue)
      addTagSpan.appendChild(spaceOne)
      var crossMark = document.createElement('SPAN')
      crossMark.id = 'id:' + addedTagArray.length
      var crossMarkValue = document.createTextNode('X')
      crossMark.appendChild(crossMarkValue)
      crossMark.style.fontSize = 'bold'
      crossMark.style.color = 'blue'
      var spaceTwo = document.createElement('SPAN')
      var spaceTwoValue = document.createTextNode(' ')
      spaceTwo.appendChild(spaceTwoValue)
      crossMark.appendChild(spaceTwo)
      crossMark.style.textDecoration
      crossMark.onclick = function () {
        deleteTag(this.id)
      }
      addTagSpan.appendChild(crossMark)
      tagBelow.appendChild(addTagSpan)
      addedTagArray.push(enteredTag)
    }
  }
  editVariable++
  flagJSONSave = 1
  editObject = taskID
}

// The edited task values after clicking the edit button in
// the rows will be updated in the respective row.
function updateTask () {
  var taskDetailDuplicate = {}
  taskDetailDuplicate.taskValue = document.getElementById('taskv').value
  if (taskDetailDuplicate.taskValue !== '' && document.getElementById('taskv').value.trim() !== '') {
    taskDetailDuplicate.selectValue = document.getElementById('sel').value.trim()
    addedTagArray = addedTagArray.filter(function (element) {
      return element !== undefined
    })
    taskDetailDuplicate.tagValue = addedTagArray
    if (addedTagArray.length !== 0) {
      taskDetailDuplicate.tagValue = addedTagArray
    } else {
      taskDetailDuplicate.tagValue = '-'
    }
    addedTagArray = []
    taskDetailsArray[editObject].taskValue = taskDetailDuplicate.taskValue
    taskDetailsArray[editObject].selectValue = taskDetailDuplicate.selectValue
    taskDetailsArray[editObject].tagValue = taskDetailDuplicate.tagValue
    document.getElementById('formid').reset()
    document.getElementById('tagDivId').innerHTML = ''
  } else {
    window.alert('Enter Task')
  }
  var xhttpOne = new XMLHttpRequest()
  var c = taskDetailsArray[editObject].id
  xhttpOne.open('DELETE', `http://localhost:3000/objects/${c}`, true)
  xhttpOne.send(null)
  var xhttpTwo = new XMLHttpRequest()
  xhttpTwo.open('POST', 'http://localhost:3000/objects', true)
  xhttpTwo.setRequestHeader('Content-type', 'application/json')
  xhttpTwo.send(JSON.stringify(taskDetailsArray[editObject]))
  flagJSONSave = 0
  editVariable = 0
}

// Deletes the respective row with the provided row id.
function deleteRowInTable (taskID) {
  var xhttp = new XMLHttpRequest()
  var c = taskDetailsArray[taskID].id
  xhttp.open('DELETE', `http://localhost:3000/objects/${c}`, true)
  xhttp.send(null)
  taskDetailsArray.splice(taskID, 1)
  displayTasks()
  calculations()
}

// Searches the entered value which should be taskname,
// tag values ,pending or completed.
function search () {
  var searchValue = document.getElementById('myInput').value
  var searchArray = []
  if (searchValue === '') {
    displayTasks()
  } else {
    for (var index = 0; index < taskDetailsArray.length; index++) {
      if (taskDetailsArray[index].taskValue.substring(0, searchValue.length) === searchValue) {
        searchArray.push(index)
      } else if (taskDetailsArray[index].selectValue.substring(0, searchValue.length) === searchValue) {
        searchArray.push(index)
      } else {
        for (var element = 0; element < taskDetailsArray[index].tagValue.length; element++) {
          if (taskDetailsArray[index].tagValue[element].substring(0, searchValue.length) === searchValue) {
            searchArray.push(index)
          }
        }
      }
    }
    deleteTable()
    addRowsToTable(searchArray)
  }
}

// Show the pending tasks when you check
// the checkbox.
function showPending () {
  var showPendingArray = []
  deleteTable()
  if (document.getElementById('checkSearch').checked) {
    for (var index = 0; index < taskDetailsArray.length; index++) {
      if (taskDetailsArray[index].selectValue === 'pending') {
        showPendingArray.push(index)
      }
    }
    addRowsToTable(showPendingArray)
  } else {
    displayTasks()
  }
}

// On clicking the clear completed, it deltes the completed .
// tasks from the table
function clearCompleted () {
  for (var index = 0; index < taskDetailsArray.length; index++) {
    if (taskDetailsArray[index].selectValue === 'completed') {
      var xhttp = new XMLHttpRequest()
      var c = taskDetailsArray[index].id
      xhttp.open('DELETE', `http://localhost:3000/objects/${c}`, true)
      xhttp.send(null)
      taskDetailsArray.splice(index, 1)
      index--
    }
  }
  displayTasks()
  calculations()
}

// Changes the pending and completed values of the already
// existing tasks by clicking on the checkbox in the row.
function invertPendingCompleted (taskID) {
  if (document.getElementById(taskID).childNodes[0].childNodes[0].checked) {
    taskDetailsArray[taskID].selectValue = 'completed'
  } else {
    taskDetailsArray[taskID].selectValue = 'pending'
  }
  var xhttpDelete = new XMLHttpRequest()
  var c = taskDetailsArray[taskID].id
  xhttpDelete.open('DELETE', `http://localhost:3000/objects/${c}`, true)
  xhttpDelete.send(null)
  var xhttpPOST = new XMLHttpRequest()
  xhttpPOST.open('POST', 'http://localhost:3000/objects', true)
  xhttpPOST.setRequestHeader('Content-type', 'application/json')
  xhttpPOST.send(JSON.stringify(taskDetailsArray[taskID]))
  calculations()
  if (document.getElementById('checkSearch').checked) {
    showPending()
  } else {
    displayTasks()
  }
}

// Calculates the pending and completed tasks percentage and
// displays in the tab in the html body.
function calculations () {
  var pendingCount = 0
  var completedCount = 0
  for (var index = 0; index < taskDetailsArray.length; index++) {
    if (taskDetailsArray[index].selectValue === 'pending') {
      pendingCount++
    } else {
      completedCount++
    }
  }
  document.getElementById('Pending').innerHTML = 'Pending Tasks: ' + pendingCount
  document.getElementById('Completed').innerHTML = 'Completed Tasks: ' + completedCount
  if (((completedCount / (pendingCount + completedCount)) * 100)) {
    document.getElementById('Progress').innerHTML = 'Progress: ' + ((completedCount / (pendingCount + completedCount)) * 100)
  } else {
    document.getElementById('Progress').innerHTML = 'Progress: ' + 0
  }
}

// toggles the arrows in the table
function toggler (togglerId) {
  var togglerClassValue = document.getElementById(togglerId).childNodes[0].className
  if (togglerClassValue === 'arrow down') {
    document.getElementById(togglerId).removeChild(document.getElementById(togglerId).childNodes[0])
    var toggleElement = document.createElement('i')
    toggleElement.className = 'arrow up'
    toggleElement.style.marginRight = '1cm'
    document.getElementById(togglerId).appendChild(toggleElement)
    sortColumns(togglerId)
  } else {
    document.getElementById(togglerId).removeChild(document.getElementById(togglerId).childNodes[0])
    var toggleElementOne = document.createElement('i')
    toggleElementOne.className = 'arrow down'
    toggleElementOne.style.marginRight = '1cm'
    document.getElementById(togglerId).append(toggleElementOne)
    displayTasks()
  }
}

function sortColumns (togglerId) {
  if (togglerId === 'sortid1' || togglerId === 'sortid4' || togglerId === 'sortid5') {
    sortSelect()
  } else if (togglerId === 'sortid2') {
    sortTask()
  } else if (togglerId === 'sortid3') {
    sortTag()
  }
}

function sortSelect () {
  deleteTable()
  var sortArray = []
  for (var index = 0; index < taskDetailsArray.length; index++) {
    if (taskDetailsArray[index].selectValue === 'completed') {
      sortArray.push(index)
    }
  }
  for (var indexOne = 0; indexOne < taskDetailsArray.length; indexOne++) {
    if (taskDetailsArray[indexOne].selectValue === 'pending') {
      sortArray.push(indexOne)
    }
  }
  addRowsToTable(sortArray)
}

function sortTask () {
  deleteTable()
  var sortArray = []
  var DuplicateTaskDetails = []
  for (var index = 0; index < taskDetailsArray.length; index++) {
    var temporaryObject = { indexValue: index, taskObject: taskDetailsArray[index] }
    DuplicateTaskDetails.push(temporaryObject)
  }
  DuplicateTaskDetails.sort(function compare (a, b) {
    // Use toUpperCase() to ignore character casing
    const genreA = a.taskObject.taskValue.toUpperCase()
    const genreB = b.taskObject.taskValue.toUpperCase()
    let comparison = 0
    if (genreA > genreB) {
      comparison = 1
    } else if (genreA < genreB) {
      comparison = -1
    }
    return comparison
  })
  for (var indexOne = 0; indexOne < taskDetailsArray.length; indexOne++) {
    sortArray.push(DuplicateTaskDetails[indexOne].indexValue)
  }
  addRowsToTable(sortArray)
}

function sortTag () {
  deleteTable()
  var sortArray = []
  var DuplicateTaskDetails = []
  for (var index = 0; index < taskDetailsArray.length; index++) {
    var temporaryObject = { indexValue: index, taskObject: taskDetailsArray[index] }
    DuplicateTaskDetails.push(temporaryObject)
  }
  DuplicateTaskDetails.sort(function compare (a, b) {
    // Use toUpperCase() to ignore character casing
    const genreA = a.taskObject.tagValue.length
    const genreB = b.taskObject.tagValue.length
    let comparison = 0
    if (genreA > genreB) {
      comparison = 1
    } else if (genreA < genreB) {
      comparison = -1
    }
    return comparison
  })
  var first = '-'
  DuplicateTaskDetails.sort(function (a, b) { return a.taskObject.tagValue[0] === first ? -1 : b.taskObject.tagValue[0] === first ? 1 : 0 })
  for (var indexOne = 0; indexOne < taskDetailsArray.length; indexOne++) {
    sortArray.push(DuplicateTaskDetails[indexOne].indexValue)
  }
  addRowsToTable(sortArray)
}
