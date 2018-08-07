//===============================================
// Example 10.1
// JavaScript source: index.js
//===============================================
//creating a global variable here to use to store the array of
// entries as the application moves from screen to screen. Yes, I
// know it's cheating, but this was the easiest way to do this.
var theEntry;
var theEntries;
var theFileSystem;
//Some HTML tag constants to use to create HTML output
var br = '<br />';
var hr = '<hr />';
var startP = '<p>';
var endP = '</p>';
//Dialog constants
var alertTitle = "File";
var alertBtn = "Continue";

function onBodyLoad() {
  //Let the user know we've launched
  alert("onBodyLoad");
  //Set the Cordova deviceready event listener, so we'll know
  //when Cordova is ready
  document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
  alert("Entering onDeviceReady");
  //Let the user know that the deviceReady event has fired
  navigator.notification.alert("Cordova is ready", null, "Device Ready", "Continue");
  alert("Leaving onDeviceReady");
}

function processDir(fileSystemType) {
  alert("Entering processDir");
  alert(fileSystemType);
  //Get a handle to the local file system (allocate 5 Mb for storage)
  window.requestFileSystem(fileSystemType, (5 * 1024 * 1024), getFileSystemSuccess, onFileError);
  alert("Leaving processDir");
}

function getFileSystemSuccess(fs) {
  alert("Entering getFileSystemSuccess");
  //Save the file system object so we can access it later
  //Yes, I know it's cheating, but it's an easier way to do this
  theFileSystem = fs;
  //Kick off a refresh of the file list
  refreshFileList();
  //Switch the directory entries page as the file list is built
  $.mobile.changePage("#dirList", {
    transition : "slide"
  }, false, true);
  alert("Leaving getFileSystemSuccess");
}

function refreshFileList() {
  alert("Entering refreshFileList");
  var dr = theFileSystem.root.createReader();
  // Get a list of all the entries in the directory
  dr.readEntries(dirReaderSuccess, onFileError);
  alert("Leaving refreshFileList");
}

function dirReaderSuccess(dirEntries) {
  alert("Entering dirReaderSuccess");
  var i, fl, len;
  //Whack the previous dir entries
  $('#dirEntryList').empty();
  //Save the entries to the global variable I created.
  theEntries = dirEntries;
  //Do we have any entries to process?
  len = dirEntries.length;
  if (len > 0) {
    //Empty out the file list variable
    fl = '';
    for ( i = 0; i < len; i++) {
      if (dirEntries[i].isDirectory) {
        fl += '<li><a href="#" onclick="processEntry(' + i + ');">Directory: ' + dirEntries[i].name + '</a></li>';
      } else {
        fl += '<li><a href="#" onclick="processEntry(' + i + ');">File: ' + dirEntries[i].name + '</a></li>';
      }
    }
  } else {
    fl = "<li>No entries found</li>";
  }
  //Update the page content with our directory list
  $('#dirEntryList').html(fl);
  $('#dirEntryList').listview('refresh');
  alert("Leaving dirReaderSuccess");
}

function processEntry(entryIndex) {
  alert("Entering processEntry");
  alert("Processing " + entryIndex);
  //Get access to the inidividual file entry
  theEntry = theEntries[entryIndex];
  //FileInfo variable
  var fi = "";
  fi += startP + '<strong>Name</strong>: ' + theEntry.name + endP;
  fi += startP + '<strong>Full Path</strong>: ' + theEntry.fullPath + endP;
  fi += startP + '<strong>URI</strong>: ' + theEntry.toURI() + endP;
  if (theEntry.isFile) {
    fi += startP + 'The entry is a file' + endP;
  } else {
    fi += startP + 'The entry is a directory' + endP;
  }

  //Update the page content with information about the file
  $('#fileInfo').html(fi);
  //Display the directory entries page
  $.mobile.changePage("#fileDetails", {
    transition : "slide"
  }, false, true);

  //Show or hide the View File button based on whether it's a 
  //directory entry or file entry
  if (theEntry.isFile) {
    //Show the results page View File button (since this is a file and we can open it)
    $('#viewFileButton').show();
  } else {
    //Hide the results page View File button (since we're working with a directory)
    $('#viewFileButton').hide();
  }
  //Now go off and see if you can get meta data about the file
  theEntry.getMetadata(getMetadataSuccess, onFileError);
  alert("Leaving processEntry");
}

function getMetadataSuccess(metadata) {
  alert("Entering getMetadataSuccess");
  alert(JSON.stringify(metadata));
  var md = '';
  for (var aKey in metadata) {
    md += '<b>' + aKey + '</b>: ' + metadata[aKey] + br;
  }
  md += hr;
  //Update the page content with information about the file
  $('#fileMetadata').html(md);
  alert("Leaving getMetadataSuccess");
}

function writeFile() {
  alert("Entering writeFile");
  if (theFileSystem) {
    //Get a file name for the file
    var theFileName = createRandomString(8) + '.txt';
    alert("File name: " + theFileName);
    var theFileOptions = {
      create : true,
      exclusive : false
    };
    alert("File Options: " + JSON.stringify(theFileOptions));
    alert("Creating file");
    theFileSystem.root.getFile(theFileName, theFileOptions, getFileSuccess, onFileError);
  } else {
    console.error("File system object null");
  }
  alert("Leaving writeFile");
}

function createRandomString(numChars) {
  var chars = "abcdefghijklmnopqrstuvwxyz";
  var tmpStr = "";
  for (var i = 0; i < numChars; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    tmpStr += chars.substring(rnum, rnum + 1);
  }
  return tmpStr;
}

function getFileSuccess(theEntry) {
  alert("Entering getFileSuccess");
  alert("Full path: " + theEntry.fullPath);
  alert("Name: " + theEntry.name);
  alert("isFile: " + theEntry.isFile);
  alert("isDir: " + theEntry.isDirectory);
  //Let the user know we have created a file
  navigator.notification.alert("File entry created.", null, alertTitle, alertBtn);
  //refresh the file list to display the new file in the list
  refreshFileList();
  //Now create the file writer to write to the file
  alert("Creating file writer");
  theEntry.createWriter(createWriterSuccess, onFileError);
  alert("Leaving getFileSuccess");
}

function createWriterSuccess(writer) {
  alert("Entering createWriterSuccess");
  //Write some writer stuff to the log
  alert("Ready State: " + writer.readyState);
  alert("File Name: " + writer.fileName);
  alert("Length: " + writer.length);
  alert("Position: " + writer.position);

  writer.onabort = function(e) {
    alert("Write aborted");
    console.error(JSON.stringify(e));
  };

  writer.onwritestart = function(e) {
    alert("Write start");
    alert(JSON.stringify(e));
  };

  writer.onwrite = function(e) {
    alert("Write completed");
    alert(JSON.stringify(e));
  };

  writer.onwriteend = function(e) {
    alert("Write end");
    alert(JSON.stringify(e));
  };

  writer.onerror = function(e) {
    console.error("Write error");
    console.error(JSON.stringify(e));
  };

  writer.write("This file created Example 10.1 from the Apache Cordova API Cookbook");
  alert("Leaving createWriterSuccess");
}

function removeFile() {
  alert("Entering removeFile");
  theEntry.remove(removeFileSuccess, onFileError);
  alert("Leaving removeFile");
}

function removeFileSuccess(entry) {
  alert("Entering onRemoveFileSuccess");
  alert(JSON.stringify(entry));
  //Let the user know the file was removed
  navigator.notification.alert("File entry removed.", null, alertTitle, alertBtn);
  //kick off a refresh of the file list
  refreshFileList();
  //Close the current page since the file no longer exists
  history.back();
  alert("Leaving onRemoveFileSuccess");
}

function viewFile() {
  alert("Entering viewFile");
  //Set the file name on the page
  $('#viewFileName').html('<h1>' + theEntry.name + '</h1>');
  //Clear out any previous load messages
  $('#readInfo').html('');
  //Display the directory entries page
  $.mobile.changePage("#viewFile", {
    transition : "slide"
  }, false, true);
  theEntry.file(fileReaderSuccess, onFileError);
  alert("Leaving viewFile");
}

function fileReaderSuccess(file) {
  alert("Entering onFileReaderSuccess");
  var reader = new FileReader();

  reader.onloadend = function(e) {
    alert("Entering onloadend");
    alert(JSON.stringify(e));
    $('#readInfo').append("Load end" + br);
    $('#fileContents').html(e.target.result);
    alert("Leaving onloadend");
  };

  reader.onloadstart = function(e) {
    alert("Entering onloadstart");
    alert(JSON.stringify(e));
    $('#readInfo').append("Load start" + br);
    alert("Leaving onloadstart");
  };

  reader.onloaderror = function(e) {
    alert("Entering onloaderror");
    alert(JSON.stringify(e));
    $('#readInfo').append("Load error: " + e.target.error.code + br);
    alert("Leaving onloaderror");
  };

  reader.readAsText(file);
  alert("Leaving onFileReaderSuccess");
}

function onFileError(errObj) {
  alert("Entering onFileError");
  console.error(JSON.stringify(errObj));
  var msgText = "Unknown error.";
  switch(errObj.code) {
    case FileError.NOT_FOUND_ERR:
      msgText = "File not found error.";
      break;
    case FileError.SECURITY_ERR:
      msgText = "Security error.";
      break;
    case FileError.ABORT_ERR:
      msgText = "Abort error.";
      break;
    case FileError.NOT_READABLE_ERR:
      msgText = "Not readable error.";
      break;
    case FileError.ENCODING_ERR:
      msgText = "Encoding error.";
      break;
    case FileError.NO_MODIFICATION_ALLOWED_ERR:
      msgText = "No modification allowed.";
      break;
    case FileError.INVALID_STATE_ERR:
      msgText = "Invalid state.";
      break;
    case FileError.SYNTAX_ERR:
      msgText = "Syntax error.";
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msgText = "Invalid modification.";
      break;
    case FileError.QUOTA_EXCEEDED_ERR:
      msgText = "Quota exceeded.";
      break;
    case FileError.TYPE_MISMATCH_ERR:
      msgText = "Type mismatch.";
      break;
    case FileError.PATH_EXISTS_ERR:
      msgText = "Path exists error.";
      break;
  }
  //Now tell the user what happened
  alert(msgText);
  navigator.notification.alert(msgText, null, alertTitle, alertBtn);
  alert("Leaving onFileError");
}
