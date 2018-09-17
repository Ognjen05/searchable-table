//view model variable
let employeesModel = [];

$(document).ready(function () {
    function initializeEmployeesModel() {
        $.ajax({
            url: "https://sleepy-atoll-17117.herokuapp.com/employees",
            type: "GET",
            contentType: "applicaton/json"
        })
            .done(function (employee) {
                employeesModel = employee;

                //invoke the function and send employeesModel as a parameter
                refreshEmployeeRows(employeesModel);
            })
            .fail(function (err) {
                showGenericModal('err', 'Unable to get Employees');
            })
    }

function showGenericModal(title, message) {

        //Set the content of genericModal 
        let $data = $("#genericModal");

        $(".modal-title").empty();
        $(".modal-body").empty();
        $(".modal-title").append(title);
        $(".modal-body").append(message);

        $data.modal({
            backdrop: 'static',
            keyboard: false
        });

}

function refreshEmployeeRows(employees) {
        //produce the HTML structure defining a template using Lodash
        let temp = _.template('<%_.forEach(employee,function(employee){ %>' +
            '<div class="row body-row" data-id=<%- employee._id %>>' +
            '<div class="col-xs-4 body-column"><%- employee.FirstName %></div>' +
            '<div class="col-xs-4 body-column"><%- employee.LastName %></div>' +
            '<div class="col-xs-4 body-column"><%- employee.Position.PositionName %></div>' +
            '</div>' +
            '<% }); %>');
        //invoke the template function                 
        let rows = temp({ 'employee': employees });
        //clear the content before adding 
        $("#employees-table").empty();
        //add the result 
        $("#employees-table").append(rows);
}

function getFilteredEmployeesModel(filterString) {
        //filter all 3 columns of the table with single string
        let compare = _.filter(employeesModel, function (employee) {
            return _.includes(employee.FirstName.toLowerCase(),
             filterString.toLowerCase()) || _.includes(employee.LastName.toLowerCase(), 
             filterString.toLowerCase()) || _.includes(employee.Position.PositionName.toLowerCase(), 
             filterString.toLowerCase());
        })
        return compare;
}

function getEmployeeModelById(id) {
        //search global employeesModel whose _id matches the id
        let lookId = _.find(employeesModel, function (employee) { 
            return employee._id == id;
        });
        //if not found return null
        if (lookId == '') {
            return null;
        }
        else {
            //if found return a deep copy 
            return _.cloneDeep(lookId);
        }
}

$(function () {
        initializeEmployeesModel();
        $("#employee-search").keyup(function () {
            let filteredArray = getFilteredEmployeesModel($("#employee-search").val());
            refreshEmployeeRows(filteredArray);
        });

        $(document).on("click", ".body-row", function () {
            //get a copy of clicked employee
            let id = $(this).attr("data-id");
            let employee = getEmployeeModelById(id);
            //convert HireDate using moment 
            let date = moment(employee.HireDate);
            let dateUtc = date.utc();
            employee.HireDate = dateUtc.format('LL');
            //define lodash template 
            let temp = _.template(
                '<strong>Address: </strong><%- employee.AddressStreet %> <%- employee.AddressCity %>, <%-employee.AddressState%> <%-employee.AddressZip%><br>' +
                '<strong>Phone Number: </strong><%-employee.PhoneNum%> ext: </strong><%-employee.Extension%><br>' +
                '<strong>Hire Date: </strong><%-employee.HireDate%>'
            );
            let tempContent = temp({ 'employee': employee });
            //invoke the showGenericModal
            showGenericModal(employee.FirstName + ' ' + employee.LastName, tempContent);
        });
    })
});