// HTML for inserting the question mark icon for doubtful DOB and age
const doubtfulIcon = ' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-square-fill" viewBox="0 0 16 16"><path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.496 6.033a.237.237 0 0 1-.24-.247C5.35 4.091 6.737 3.5 8.005 3.5c1.396 0 2.672.73 2.672 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.105a.25.25 0 0 1-.25.25h-.81a.25.25 0 0 1-.25-.246l-.004-.217c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.803 0-1.253.478-1.342 1.134-.018.137-.128.25-.266.25h-.825zm2.325 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927z"/><title>Doubtful</title></svg>';

var mydata, movies;
CSV.fetch({
	url:'https://raw.githubusercontent.com/ikki123-aidoru/idol_database/main/movies.tsv'
}).done(function(dataset) {
	movies = dataset['records'];
})

CSV.fetch({
	url: 'https://raw.githubusercontent.com/ikki123-aidoru/idol_database/main/idols.tsv'
}).done(function(dataset) {
	mydata = dataset['records'];
	$(document).ready(idolTable(mydata));
});

/**
 * Filter the movies data by idol name
 * @param {string[][]} moviesArr - 2d array of movies
 * @param {string} idol - Idol name
 * @returns {string[][]} 2d array of movies
 */
function getMovies(moviesArr, idol) {
	var resultArr = new Array();
	moviesArr.forEach(element => {
		if (element[4] == idol) {
			resultArr.push(element);
		}
	})
	return resultArr;
}

/** Create child (movies) rows under an idol row
 * @param {*} row - a row object from DataTable
 */
function createChild(row) {
	var DateTime = luxon.DateTime;
	var returnHTML;

	// Table placeholder
	var table = $('<table class="display" width="100%"/>')
	
	// Parent row
	var rowdata = row.data();
	
	// Show and initialize the table
	row.child(table).show();
	var moviesTable = table.DataTable ({
		data: getMovies(movies, rowdata[0]),
		columns: [
			{ title: "Title", data: 0},
			{ title: "Release Date", data: null, render: function(data, type, subrow, meta){ // subrow is based on the data option above
				var releaseDate = readDate(subrow[3]);
				return releaseDate.toISODate();
			}},
			{ title: "Age", data: null, render: function(data, type, subrow, meta){ // subrow is based on the data option above
				var birthDate = readDate(rowdata[3]);
				var releaseDate = readDate(subrow[3]);
				if (releaseDate.isValid && birthDate.isValid) {
					var dateDiff = releaseDate.diff(birthDate, ["years", "months", "days"]).toObject();
					returnHTML = dateDiff["years"] + "y " + dateDiff["months"] + "m";
					return (rowdata[4] != null && rowdata[4].toLowerCase() == "yes" ? "<font color = 'orange'>" + returnHTML + doubtfulIcon + "</font>" : returnHTML);
				} else {
					return "";
				}
			}}
		],
		order: [[1, 'asc'], [0, 'asc']]
	});

}

/**
 * Convert a string to a date
 * @param {string} dateStr - String to be converted to a date
 * @returns {Date}
 */
function readDate(dateStr) {
	var DateTime = luxon.DateTime;
	if (dateStr.includes('/'))
		return DateTime.fromFormat(dateStr, 'dd/MM/yy');
	else if (dateStr.includes('-'))
		return DateTime.fromISO(dateStr);
	else
		return false;
}


function destroyChild(row) {
    var table = $("table", row.child());
    table.detach();
    table.DataTable().destroy();
 
    // And then hide the row
    row.child.hide();
}

function idolTable(mydata) {

	// Define Table
	var table = $('#idols').DataTable({
		data: mydata,
		pageLength: 25,
		columns: [
			{
				"className": 'details-control',
				"orderable": false,
				"data": null,
				"defaultContent": ''
			},
			{ title: "Name", data: 0},
			{ title: "Japanese Name", data: 1},
			{ title: "Alias", data: 2},
			{ title: "DOB", data: 3, render: function(data, type, row, meta) {
				return ((row[4] == null ? row[4] : row[4].toLowerCase()) == "yes" ? "<font color = 'orange'>" + data + doubtfulIcon + "</font>" : data);
			}},
			{ title: "Doubtful DOB", data: 4, visible: false}
		],
		order: [[1, 'asc']]
	});

	// Add click listener
    $('#idols tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );
 
        if ( row.child.isShown() ) {
            // This row is already open - close it
            destroyChild (row);
            tr.removeClass('shown');
        }
        else {
            // Open this row
            createChild (row);
            tr.addClass('shown');
        }
    } );
}
