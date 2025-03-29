$(document).ready(function () {

    loadCategories();

    let firstCategory = $(".category-item").first();
    firstCategory.addClass("active");

    let firstCategoryId = firstCategory.data("id");
    if (firstCategoryId) {
        loadItems(firstCategoryId);
    }
    loadItems(1, pageNumber = 1, pageSize = 5, searchTerm = "")
    loadModifiers(1);

    $("#addEditCategoryForm").submit(function (e) {
        e.preventDefault();
        console.log("hjhd")

        if (!$(this).valid()) {
            return;
        }

        if ($(this).data("edit-mode") === true) {
            updateCategory();
        } else {
            addCategory();
        }
    });
});


function loadCategories() {
    $.ajax({
        url: "/Menu/GetCategories",
        type: "GET",
        success: function (response) {
            $("#categoryContainer").html(response);
        },
        error: function () {
            toastr.error("Error fetching categories.");
        }
    });
}


// add category

function addCategory() {
    let categoryData = {
        name: $("#categoryname").val(),
        description: $("#categorydescription").val()
    };

    $.ajax({
        url: "/Menu/AddCategory",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(categoryData),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $("#categoryModal").modal("hide");
                $("#categoryname, #categorydescription").val("");
                loadCategories();
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("Error adding category");
        }
    });
}

// update category

function updateCategory() {
    let categoryId = $("#addEditCategoryForm").data("category-id");


    let categoryData = {
        Id: categoryId,
        Name: $("#categoryname").val(),
        Description: $("#categorydescription").val()
    };

    console.log("Sending Category Data:", categoryData);

    $.ajax({
        url: "/Menu/UpdateCategory",
        type: "PUT",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify(categoryData),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $("#categoryModal").modal("hide");
                $("#categoryname, #categorydescription").val("");
                $("#saveCategoryBtn").data("edit-mode", false).removeData("category-id");
                loadCategories();
            } else {
                toastr.error(response.message);
            }
        },
        error: function (xhr) {
            toastr.error(" Error Response:", xhr.responseText);
        }
    });
}


$(document).on("click", ".edit-category", function () {
    let categoryItem = $(this).closest(".category-item");
    let categoryId = categoryItem.data("id");
    let categoryName = categoryItem.data("name");
    let categoryDescription = categoryItem.data("description");

    $("#categoryname").val(categoryName);
    $("#categorydescription").val(categoryDescription);
    $("#addEditCategoryForm").data("edit-mode", true).data("category-id", categoryId);
    $("#categoryModal").modal("show");
});


// delete category

$(document).on("click", ".delete-category", function () {
    let categoryId = $(this).data("id");
    $("#confirmDeleteBtnCategory").data("category-id", categoryId);
    $("#deleteCategoryModal").modal("show");
});

$("#confirmDeleteBtnCategory").click(function () {
    let categoryId = $(this).data("category-id");
    deleteCategory(categoryId);
    $("#deleteCategoryModal").modal("hide");
});

function deleteCategory(categoryId) {

    console.log("sending delete request id", categoryId)
    $.ajax({
        url: "/Menu/DeleteCategory",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ id: categoryId }),
        success: function (response) {
            if (response.success) {
                toastr.success("Category deleted successfully");
                loadCategories();
            } else {
                toastr.error("Failed to delete category");
            }
        },
        error: function () {
            toastr.error("Error deleting category");
        }
    });
}

// make categoty active when selected

$(document).on("click", ".category-item", function (event) {
    event.stopPropagation();


    $(".category-item").removeClass("selected");
    $(".category-actions").addClass("d-none");


    $(this).addClass("selected");
    $(this).find(".category-actions").removeClass("d-none");
});


$('#categoryModal').on('hidden.bs.modal', function () {
    $("#categoryname").val('');
    $("#categorydescription").val('');
    $("#saveCategoryBtn").removeData("edit-mode").removeData("category-id");
});

$(document).on("click", "[data-bs-target='#categoryModal']", function () {
    $("#categoryname").val('');
    $("#categorydescription").val('');
    $("#saveCategoryBtn").removeData("edit-mode").removeData("category-id");
});



$(document).on("click", ".category-item", function () {
    let categoryId = $(this).data("id");
    $(".category-item").removeClass("selected");
    $(this).addClass("selected");
    loadItems(categoryId, pageNumber = 1, pageSize = 5);
});

$("#searchItems").on("keyup", function () {
    clearTimeout(this.delay);
    this.delay = setTimeout(function () {
        searchItems();
    }, 300);
});

function searchItems() {
    let categoryId = $(".category-item.selected").data("id");
    let searchTerm = $("#searchItems").val().trim();
    loadItems(categoryId, 1, 5, searchTerm);
}

function loadItems(categoryId, pageNumber = 1, pageSize = 5, searchTerm = "") {
    $.ajax({
        url: "/Menu/GetItemsByCategory",
        type: "GET",
        data: { categoryId: categoryId, pageNumber: pageNumber, pageSize: pageSize, searchTerm: searchTerm },
        success: function (response) {
            $("#itemContainer").html(response);

            $("#itemsPerPage").val(pageSize);


            $(".pagination-link").removeClass("active");
            $(".pagination-link[data-page='" + pageNumber + "']").addClass("active");
        },

        error: function () {
            toastr.error("Error fetching items.");
        }
    });
}

// Handle pagination button clicks
$(document).on("click", ".pagination-link", function (e) {
    e.preventDefault();
    let categoryId = $(".category-item.selected").data("id");
    let pageNumber = $(this).data("page");
    let pageSize = $("#itemsPerPage").val();
    loadItems(categoryId, pageNumber, pageSize);
});

// Handle items per page dropdown
$(document).on("change", "#itemsPerPage", function () {
    let categoryId = $(".category-item.selected").data("id");
    loadItems(categoryId, 1, $(this).val()); // Reset to first page
});




// @* $("#addMenuItemForm").submit(function (e) {





//     e.preventDefault();

//     var formData = new FormData(this);

//     $.ajax({
//         url: '/Menu/AddMenuItem',
//         type: 'POST',
//         data: formData,
//         contentType: false,
//         processData: false,
//         success: function (response) {
//     if (response.success) {
//     toastr.success("Item added successfully");
//     $("#addMenuItemModal").modal("hide");
//     $("#addMenuItemForm")[0].reset();
//     } else {
//                 toastr.error("Failed to add item");
//     }
//     },
//         error: function () {
//     toastr.error("Something went wrong");
//     }
//     });
//     }); *@

// @* edit item *@
$(document).on("click", ".edit-item", function () {
    let itemId = $(this).data("id");

    $.ajax({
        url: '/Menu/GetItemById',
        type: 'GET',
        data: { id: itemId },
        success: function (item) {
            console.log("Item received:", item);
            console.log("item category id", item.categoryid);
            $("#ItemId").val(item.id);
            $("#categoryid").val(item.categoryid);
            $("#Name").val(item.name);
            $("#Rate").val(item.rate);
            $("#Quantity").val(item.quantity);
            $("#Unit").val(item.unit);
            $("#ItemType").val(item.itemType);
            $("#ShortCode").val(item.shortCode);
            $("#Description").val(item.description);
            $("#TaxPercentage").val(item.taxPercentage);
            $("#IsAvailable").prop("checked", item.isAvailable);
            $("#IsDefaultTax").prop("checked", item.isDefaultTax);


            $("#EditItemModal").modal('show');
        }
    });
});



$("#addMenuItemForm").submit(function (e) {
    e.preventDefault();

    if (!$(this).valid()) {
        return;
    }

    var formData = new FormData(this);
    console.log("formData is", formData);

    $.ajax({
        url: '/Menu/AddMenuItem',
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {

            if (response.success) {
                toastr.success("Item added successfully");
                $("#addMenuItemModal").modal("hide");
                $("#addMenuItemForm")[0].reset();
                let currentCategoryId = $(".category-item.selected").data("id");
                let pageSize = $("#itemsPerPage").val();
                let pageNumber = $(".pagination-link.active").data("page");

                loadItems(currentCategoryId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to Add item");
            }
        },
        error: function () {
            toastr.error("Something went wrong");
        }
    });
});

$("#editMenuItemForm").submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
        url: `/Menu/EditMenuItem/${$("#ItemId").val()}`,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (response) {

            if (response.success) {
                toastr.success("Item edited successfully");
                $("#EditItemModal").modal("hide");
                $("#editMenuItemForm")[0].reset();
                let currentCategoryId = $(".category-item.selected").data("id");
                let pageSize = $("#itemsPerPage").val();
                let pageNumber = $(".pagination-link.active").data("page");

                loadItems(currentCategoryId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to edit item");
            }
        },
        error: function () {
            toastr.error("Something went wrong");
        }
    });
});





// @* delete item *@

$(document).on("click", ".delete-item", function () {
    var itemId = $(this).data("id");
    $("#confirmDeleteBtnItem").data("id", itemId);
    $("#deleteItemModal").modal("show");
});

$("#confirmDeleteBtnItem").click(function () {
    var itemId = $(this).data("id");
    deleteItem(itemId);
    $("#deleteItemModal").modal("hide");
});

function deleteItem(itemId) {
    $.ajax({
        url: "/Menu/DeleteItem",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ id: itemId }),
        success: function (response) {
            console.log("delete response", response);
            if (response.success) {
                toastr.success("Item deleted successfully");
                let currentCategoryId = $(".category-item.selected").data("id");
                let pageSize = $("#itemsPerPage").val();
                let pageNumber = $(".pagination-link.active").data("page");

                loadItems(currentCategoryId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to delete Item");
            }
        },
        error: function (xhr, status, error) {
            console.error("error deleting Item", xhr.responseText);
            toastr.error("Error deleting Item");
        }
    });
}

// @* select all checkbox *@

$(document).on("change", "#selectAllCheckbox", function () {
    if ($(this).is(":checked")) {
        $(".row-checkbox").prop("checked", true);
    } else {
        $(".row-checkbox").prop("checked", false);
    }
});

$(document).on("change", ".row-checkbox", function () {
    if ($(".row-checkbox:checked").length == $(".row-checkbox").length) {
        $("#selectAllCheckbox").prop("checked", true);
    } else {
        $("#selectAllCheckbox").prop("checked", false);
    }
});

$("#deleteSelectedBtn").click(function () {
    let selectedIds = [];
    $(".row-checkbox:checked").each(function () {
        selectedIds.push($(this).val());
    });

    if (selectedIds.length === 0) {
        alert("Please select at least one item.");
        return;
    }

    $("#deleteItemsId").val(selectedIds.join(","));

});

$("#confirmDeleteBtnItems").click(function () {
    let itemIds = $("#deleteItemsId").val().split(",").map(Number);

    $.ajax({
        url: '/Menu/SoftDeleteItems',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(itemIds),
        success: function (response) {
            if (response.success) {
                $("#deleteItemsModal").modal('hide');
                toastr.success("Items Deleted Successfully");
                let currentCategoryId = $(".category-item.selected").data("id");
                let pageSize = $("#itemsPerPage").val();
                let pageNumber = $(".pagination-link.active").data("page");

                loadItems(currentCategoryId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to Delete Items");
            }
        }
    });


});

$(document).on("click", ".modifiergroup-item", function (event) {
    event.stopPropagation();


    $(".modifiergroup-item").removeClass("selected");
    $(".editdelete-actions").addClass("d-none");



    $(this).addClass("selected");
    $(this).find(".editdelete-actions").removeClass("d-none");
});



// @* add modifiergroup *@



// $("#addModifierGroupForm").submit(function (event) {
//     event.preventDefault(); // Prevent page refresh

//     let formData = {
//         Name: $("#modifiergroupname").val(),
//         Description: $("#modifiergroupdescription").val()
//     };

//     $.ajax({
//         url: "/Menu/AddModifierGroup",
//         type: "POST",
//         contentType: "application/json",
//         data: JSON.stringify(formData),
//         success: function (response) {
//             if (response.success) {
//                 toastr.success(response.message);
//                 $("#addModifierGroup").modal("hide");
//                 loadModifierGroups();
//             } else {
//                 toastr.error(response.message);
//             }
//         },
//         error: function () {
//             toastr.error("Error adding modifier group.");
//         }
//     });
// });


$("#addModifierGroupForm").on("submit", function (e) {
    e.preventDefault();

    if (!$(this).valid()) {
        return;
    }

    let selectedModifierIds = [];
    $(".selected-modifier").each(function () {
        selectedModifierIds.push($(this).data("id"));
    });
    console.log("selectedmodifierids", selectedModifierIds)
    let modifierGroupData = {
        name: $("#modifiergroupname").val(),
        description: $("#modifiergroupdescription").val(),
        modifierIds: selectedModifierIds
    };
    console.log("modifiergroupdata", modifierGroupData);
    $.ajax({
        url: "/Menu/AddModifierGroup",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(modifierGroupData),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $("#addModifierGroup").modal("hide");
                $("#addModifierGroup").find("input, textarea").val("");
                $("#selectedModifiersContainer").empty();
                selectedModifiers.clear();
                loadModifierGroups();
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("Error adding Modifier Group.");
        }
    });
});




// @* loadModifierGroups  *@

function loadModifierGroups() {
    $.ajax({
        url: "/Menu/GetModifierGroup",
        type: "GET",
        success: function (response) {
            $("#modifierGroupContainer").html(response);
        },
        error: function () {
            toastr.error("Error fetching modifier groups.");
        }
    });
}

// modifier searchTerm

$("#searchModifiers").on("keyup", function () {
    clearTimeout(this.delay);
    this.delay = setTimeout(function () {
        searchModifiers();
    }, 300);
});

function searchModifiers() {
    let modifierGroupId = $(".modifiergroup-item.selected").data("id");
    let searchTerm = $("#searchModifiers").val().trim();
    loadModifiers(modifierGroupId, 1, 5, searchTerm); // Reset to first page on search
}

// @* load modifier according to ModifierGroupId *@

$(document).on("click", ".modifiergroup-item", function () {
    let ModifierGroupId = $(this).data("id");

    loadModifiers(ModifierGroupId, pageNumber = 1, pageSize = 5);
});

function loadModifiers(ModifierGroupId, pageNumber = 1, pageSize = 5, searchTerm = "") {

    $.ajax({
        url: "/Menu/GetModifiersByModifierGroup",
        type: "GET",
        data: { ModifierGroupId: ModifierGroupId, pageNumber: pageNumber, pageSize: pageSize, searchTerm: searchTerm },
        success: function (response) {
            $("#ModifersListContainer").html(response);
            $("#ModifierPerPage").val(pageSize);
            $(".modifierpagination-link").removeClass("active");
            $(".modifierpagination-link[data-page='" + pageNumber + "']").addClass("active");
        },
        error: function () {
            toastr.error("Error fetching modifiers.");
        }
    });

}


// Handle pagination button clicks
$(document).on("click", ".modifierpagination-link", function (e) {
    e.preventDefault();
    let ModifierGroupId = $(".modifiergroup-item.selected").data("id");
    let pageNumber = $(this).data("page");
    let pageSize = $("#ModifierPerPage").val();
    loadModifiers(ModifierGroupId, pageNumber, pageSize);
});

// Handle items per page dropdown
$(document).on("change", "#ModifierPerPage", function () {
    let ModifierGroupId = $(".modifiergroup-item.selected").data("id");
    loadModifiers(ModifierGroupId, 1, $(this).val()); // Reset to first page
});


// @* delete ModifierGroup *@

$(document).on("click", ".delete-modifiergroup", function () {
    let modifiergroupid = $(this).data("id");

    $("#confirmDeleteBtnModifierGroup").data("modifiergroup-id", modifiergroupid);
    $("#deleteModifierGroupModal").modal("show");
});

$("#confirmDeleteBtnModifierGroup").click(function () {
    let modifiergroupid = $(this).data("modifiergroup-id");

    deleteModifierGroup(modifiergroupid);
    $("#deleteModifierGroupModal").modal("hide");
});

function deleteModifierGroup(modifiergroupid) {


    $.ajax({
        url: "/Menu/DeleteModifierGroup",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ id: modifiergroupid }),
        success: function (response) {
            console.log("delete response", response);
            if (response.success) {
                toastr.success("ModifierGroup deleted successfully");
                loadModifierGroups();
            } else {
                toastr.error("Failed to delete ModifierGroup");
            }
        },
        error: function (xhr, status, error) {
            console.error("error deleting ModifierGroup", xhr.responseText);
            toastr.error("Error deleting ModifierGroup");
        }
    });
}

// @* UpdateModifierGroup  *@

$("#openExistingModifierEditModal").click(function (e) {
    e.preventDefault();

    $("#EditModifierGroupModal").modal("hide");
    $("#EditModifierGroupModal").on("hidden.bs.modal", function () {
        $("#selectExistingModifierForEditModal").modal("show");
        $(this).off("hidden.bs.modal");
        loadAllModifierss(1, 5, ""); // Load first page
    });
});

$(document).on("click", "#openExistingModifierEditModal", function () {


    setTimeout(() => {
        $(".allmodifieredit-checkbox").each(function () {
            let modifierId = $(this).val();
            $(this).prop("checked", selectedModifiersForEdit.has(modifierId));
        });
    }, 300);
});


$(document).on("click", ".edit-modifiergroup", function () {
    let modifierGroupId = $(this).data("id");


    $.ajax({
        url: "/Menu/GetModifierGroupById",
        type: "GET",
        data: { id: modifierGroupId },
        success: function (data) {
            if (data) {
                $("#editModifierGroupId").val(data.id);
                $("#editModifierGroupName").val(data.name);
                $("#editModifierGroupDescription").val(data.description);
                $("#selectedEditModifiersContainer").empty();
                selectedModifiersForEdit.clear(); // Clear previous selections

                let modifiersHtml = "";
                data.availableModifiers.forEach(modifier => {
                    let isSelected = data.modifierIds.includes(modifier.id); // Check if assigned

                    if (isSelected) {
                        selectedModifiersForEdit.set(modifier.id.toString(), modifier.name); // Store in Map
                    }

                    modifiersHtml += `
                        <span class="btn btn-light p-2 me-2 selected-modifieredit ${isSelected ? "selected-modifier" : ""}"
                            id="selectedModifier_${modifier.id}" data-id="${modifier.id}">
                            ${modifier.name} <span class="remove-modifier" style="cursor:pointer;">&times;</span>
                        </span>`;
                });

                $("#selectedEditModifiersContainer").html(modifiersHtml);
                $("#EditModifierGroupModal").modal("show");
            } else {
                toastr.error("Modifier Group not found.");
            }
        },
        error: function () {
            toastr.error("Error fetching data.");
        }
    });
});

// @* Handle Update Form Submission *@
$("#editModifierGroupForm").submit(function (event) {
    event.preventDefault();

    if (!$(this).valid()) {
        return;
    }
    console.log("jfgiuh");

    let selectedModifierIds = [];
    $(".selected-modifieredit").each(function () {
        selectedModifierIds.push($(this).data("id"));
    });

    console.log("selecte ids for edit", selectedModifierIds);

    let updatedData = {
        Id: $("#editModifierGroupId").val(),
        Name: $("#editModifierGroupName").val(),
        Description: $("#editModifierGroupDescription").val(),
        ModifierIds: selectedModifierIds
    };

    $.ajax({
        url: "/Menu/UpdateModifierGroup",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(updatedData),
        success: function (response) {
            if (response.success) {
                toastr.success(response.message);
                $("#EditModifierGroupModal").modal("hide");
                let currentGroupId = $(".modifiergroup-item.selected").data("id");
                let pageSize = $("#ModifierPerPage").val();
                let pageNumber = $(".modifierpagination-link.active").data("page");
                loadModifiers(currentGroupId, pageNumber, pageSize);
            } else {
                toastr.error(response.message);
            }
        },
        error: function () {
            toastr.error("Error updating modifier group.");
        }
    });
});

// @* add modifires  *@

$(document).on("change", ".modifier-checkbox", function () {
    updateSelectedValues();
});

function updateSelectedValues() {
    var selectedValues = $(".modifier-checkbox:checked").map(function () {
        return $(this).val();
    }).get();
    console.log("selectedvalue", selectedValues)

    $("#ModifierGroupIds").val(selectedValues.join(","));


    $("#modifierDropdown").text(
        selectedValues.length > 0 ? selectedValues.length + " selected" : "Select Modifier Group(s)"
    );


    $("#selectAll").prop("checked", $(".modifier-checkbox").length === $(".modifier-checkbox:checked").length);

    if (selectedValues.length > 0) {
        $("#ModifierGroupIds").removeClass("is-invalid");
        $("#ModifierGroupIdsError").text("");
    }
}

$(document).on("change", "#selectAll", function () {
    $(".modifier-checkbox").prop("checked", $(this).prop("checked"));
    updateSelectedValues();
});

//addmodal reset
$(document).on('hidden.bs.modal', '#addModifierModal', function () {
    console.log("Modal hidden event fired!");


    $('#AddModifierForm')[0].reset();
    $('#AddModifierForm').find('.is-invalid').removeClass('is-invalid');
    $('#AddModifierForm').validate().resetForm();
    $("#ModifierGroupIds").removeClass("is-invalid");
    $("#ModifierGroupIdsError").text("");


});



// @* add modifires  *@
$("#AddModifierForm").submit(function (event) {
    event.preventDefault();

    var selectedValues = $(".modifier-checkbox:checked").map(function () {
        return parseInt($(this).val(), 10);
    }).get();

    if (selectedValues.length === 0) {
        $("#ModifierGroupIds").addClass("is-invalid");
        $("#ModifierGroupIdsError").text("At least one Modifier Group must be selected.");
        return;
    }

    if (!$(this).valid()) {
        return;
    }

    updateSelectedValues();


    var formData = {
        ModifierGroupIds: selectedValues,
        Name: $("#Name1").val(),
        Price: parseFloat($("#Rate1").val()),
        Unittype: $("#Unit1").val(),
        Quantity: parseInt($("#Quantity1").val(), 10),
        Description: $("#Description1").val()
    };

    $.ajax({
        type: "POST",
        url: "/Menu/AddModifier",
        data: JSON.stringify(formData),
        contentType: "application/json",
        processData: false,
        success: function (response) {
            console.log("Server Response:", response);
            if (response.success) {
                toastr.success("Modifier added Successfully");
                $("#addModifierModal").modal("hide");
                let currentGroupId = $(".modifiergroup-item.selected").data("id");
                let pageSize = $("#ModifierPerPage").val();
                let pageNumber = $(".modifierpagination-link.active").data("page");
                $('#AddModifierForm')[0].reset();
                // Reset checkboxes
                $(".modifier-checkbox").prop("checked", false);
                $("#selectAll").prop("checked", false);

                // Reset dropdown & hidden field
                $("#ModifierGroupIds").val("");
                $("#modifierDropdown").text("Select Modifier Group(s)");
                loadModifiers(currentGroupId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to add modifier");
            }
        },
        error: function (xhr) {
            0
            console.error(" Error Response:", xhr.responseText);
            toastr.error("Validation failed. Check console for details.");
        }
    });
});



// @* updatemodifier *@

$(document).on("click", ".edit-modifier", function () {
    let modifierId = $(this).data("id");

    $.ajax({
        url: '/Menu/GetModifierById',
        type: 'GET',
        data: { id: modifierId },
        success: function (modifier) {
            $("#modifierId").val(modifier.id);
            $("#Name2").val(modifier.name);
            $("#Rate2").val(modifier.price);
            $("#Quantity2").val(modifier.quantity);
            $("#Unit2").val(modifier.unittype);
            $("#Description2").val(modifier.description);

            // Clear previous selections
            $(".edit-modifier-checkbox").prop("checked", false);

            // Check only the ones that match the selected ModifierGroupIds
            if (modifier.modifierGroupIds && modifier.modifierGroupIds.length > 0) {
                modifier.modifierGroupIds.forEach(function (groupId) {
                    $(".edit-modifier-checkbox[value='" + groupId + "']").prop("checked", true);
                });
            }


            $("#EditModifiersModal").modal('show');
        },
        error: function () {
            toastr.error("Failed to load modifier details.");
        }
    });
});


// @*
//     updatemodifier *@

$("#EditModifierForm").submit(function (e) {
    e.preventDefault();
    let selectedModifierGroups1 = $(".edit-modifier-checkbox:checked").map(function () {
        return parseInt($(this).val(), 10);
    }).get();

    if (selectedModifierGroups1.length === 0) {

        $("#ModifierGroupIds").addClass("is-invalid");
        $("#ModifierGroupIdsError").text("At least one Modifier Group must be selected.");
        return;
    }

    if (!$(this).valid()) {
        return;
    }

    let formData = {
        Id: $("#modifierId").val(),
        ModifierGroupIds: selectedModifierGroups1,  // Send checked group IDs
        Name: $("#Name2").val(),
        Price: parseFloat($("#Rate2").val()),
        Quantity: parseInt($("#Quantity2").val(), 10),
        Unittype: $("#Unit2").val(),
        Description: $("#Description2").val()
    };

    $.ajax({
        url: '/Menu/EditModifier',
        type: 'POST',
        contentType: "application/json",
        data: JSON.stringify(formData),
        success: function (response) {
            if (response.success) {
                toastr.success("Modifier edited successfully");
                $("#EditModifiersModal").modal("hide");
                $("#EditModifierForm")[0].reset();

                let currentGroupId = $(".modifiergroup-item.selected").data("id");
                let pageSize = $("#ModifierPerPage").val();
                let pageNumber = $(".modifierpagination-link.active").data("page");
                loadModifiers(currentGroupId, pageNumber, pageSize);
            } else {
                if (response.message === "No changes detected.") {
                    toastr.error("No changes detected. Please modify something before saving.");
                } else {
                    toastr.error("Failed to edit item");
                }
            }
        },
        error: function () {
            toastr.error("Something went wrong");
        }
    });
});


// @* deleteModifier *@

$(document).on("click", ".delete-modifier", function () {
    let modifierId = $(this).data("id");
    let groupId = $(".modifiergroup-item.selected").data("id"); // Get selected group
    console.log("group id", groupId);
    $("#confirmDeleteBtnModifier").data("id", modifierId);
    $("#confirmDeleteBtnModifier").data("group-id", groupId);
});

$("#confirmDeleteBtnModifier").click(function () {
    let modifierId = $(this).data("id");
    let groupId = $(this).data("group-id");
    console.log("group id", groupId);
    softDeleteModifierFromGroup(modifierId, groupId);
    $("#deleteModifierModal").modal("hide");
});

function softDeleteModifierFromGroup(modifierId, groupId) {
    $.ajax({
        url: "/Menu/SoftDeleteModifierFromGroup",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({ modifierId: modifierId, groupId: groupId }),
        success: function (response) {
            if (response.success) {
                toastr.success("Modifier deleted from group successfully");

                let currentGroupId = $(".modifiergroup-item.selected").data("id");
                let pageSize = $("#ModifierPerPage").val();
                let pageNumber = $(".modifierpagination-link.active").data("page");

                loadModifiers(currentGroupId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to delete modifier from group");
            }
        },
        error: function () {
            toastr.error("Error deleting modifier from group");
        }
    });
}



// @* massdelete modifiers *@

$("#deleteSelectedBtnForModifier").click(function () {
    let selectedIds = [];
    $(".row-checkbox:checked").each(function () {
        selectedIds.push(parseInt($(this).val()));
    });

    if (selectedIds.length === 0) {
        alert("Please select at least one item.");
        return;
    }

    $("#deleteModifiersId").val(selectedIds.join(","));
});

$("#confirmDeleteBtnModifiers").click(function () {
    let modifierIds = $("#deleteModifiersId").val().split(",").map(Number);
    let groupId = $(".modifiergroup-item.selected").data("id");

    $.ajax({
        url: "/Menu/SoftDeleteModifiers",
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({ modifierIds: modifierIds, groupId: groupId }),
        success: function (response) {
            if (response.success) {
                $("#deleteModifiersModal").modal("hide");
                toastr.success("Modifiers Deleted Successfully");

                let pageSize = $("#ModifierPerPage").val();
                let pageNumber = $(".modifierpagination-link.active").data("page");
                loadModifiers(groupId, pageNumber, pageSize);
            } else {
                toastr.error("Failed to Delete Modifiers");
            }
        },
        error: function () {
            toastr.error("Error Deleting Modifiers");
        }
    });
});


// @* addexistingmodifier *@


$("#openExistingModifierModal").click(function (e) {
    e.preventDefault();

    $("#addModifierGroup").modal("hide");
    $("#addModifierGroup").on("hidden.bs.modal", function () {
        $("#selectExistingModifierModal").modal("show");
        $(this).off("hidden.bs.modal");
    });
});

$("#searchAllModifierss").on("keyup", function () {
    clearTimeout(this.delay);
    this.delay = setTimeout(function () {
        searchModiferss();
    }, 300);
});

function searchModiferss() {
    let searchTerm = $("#searchAllModifierss").val().trim();
    loadAllModifierss(pageNumber = 1, pageSize = 5, searchTerm);
}

// Handle pagination button clicks
$(document).on("click", ".allmodifierpagination-link", function (e) {
    e.preventDefault();
    let pageNumber = $(this).data("page");
    let pageSize = $("#AllModifierPerPage").val();
    loadAllModifierss(pageNumber, pageSize);
});

// Handle items per page dropdown
$(document).on("change", "#AllModifierPerPage", function () {
    loadAllModifierss(1, $(this).val()); // Reset to first page
});



// addmodifier in modifiergroup


let selectedModifiers = new Map();


function loadAllModifierss(pageNumber = 1, pageSize = 5, searchTerm = "") {
    $.ajax({
        url: "/Menu/GetAllModifiersToModal",
        type: "GET",
        data: { pageNumber: pageNumber, pageSize: pageSize, searchTerm: searchTerm },
        success: function (response) {
            $("#ModifersListToAddModiferGroupContainer").html(response);
            $("#AllModifierPerPage").val(pageSize);
            $(".allmodifierpagination-link").removeClass("active");
            $(".allmodifierpagination-link[data-page='" + pageNumber + "']").addClass("active");


            $(".allmodifier-checkbox").each(function () {
                let modifierId = $(this).val();
                $(this).prop("checked", selectedModifiers.has(modifierId));
            });
        },
        error: function () {
            toastr.error("Error fetching modifiers.");
        }
    });
}

$(document).on("change", ".allmodifier-checkbox", function () {
    let modifierId = $(this).val();
    let modifierName = $(this).data("name");

    if ($(this).is(":checked")) {
        selectedModifiers.set(modifierId, modifierName);
    } else {
        selectedModifiers.delete(modifierId);
        $(`#selectedModifier_${modifierId}`).remove();
    }
});


$(document).on("click", ".allmodifierpagination-link", function (e) {
    e.preventDefault();
    let pageNumber = $(this).data("page");
    let pageSize = $("#AllModifierPerPage").val();
    loadAllModifierss(pageNumber, pageSize);
});


$(document).on("change", "#AllModifierPerPage", function () {
    loadAllModifierss(1, $(this).val());
});


$("#addModifiersBtn").on("click", function () {
    $("#selectedModifiersContainer").empty();

    selectedModifiers.forEach((modifierName, modifierId) => {
        if ($(`#selectedModifier_${modifierId}`).length === 0) {
            $("#selectedModifiersContainer").append(`
                <span class="btn btn-light p-2 me-2 selected-modifier" id="selectedModifier_${modifierId}" data-id="${modifierId}">
                    ${modifierName} <span class="remove-modifier" style="cursor:pointer;">&times;</span>
                </span>
            `);
        }
    });
    console.log("modifer id for edit", selectedModifiers);

    $("#selectExistingModifierModal").modal("hide");
    setTimeout(() => {
        $("#addModifierGroup").modal("show");
    }, 500);
});


$(document).on("click", ".remove-modifier", function () {
    let modifierId = $(this).parent().data("id");

    let modifierKey = modifierId.toString();

    if (selectedModifiers.has(modifierKey)) {
        selectedModifiers.delete(modifierKey);
    }
    $(this).parent().remove();


    $(".allmodifier-checkbox").each(function () {
        if ($(this).val() === modifierId) {
            $(this).prop("checked", false);
        }
    });
});


$(document).on("click", "#openExistingModifierModal", function () {
    loadAllModifierss(1, 5, "");


    setTimeout(() => {
        $(".allmodifier-checkbox").each(function () {
            let modifierId = $(this).val();
            $(this).prop("checked", selectedModifiers.has(modifierId));
        });
    }, 300);
});



// for edit

// editmodifier in modifiergroup


let selectedModifiersForEdit = new Map();


function loadAllModifierssForEdit(pageNumber = 1, pageSize = 5, searchTerm = "") {
    $.ajax({
        url: "/Menu/GetAllModifiersToModalForEdit",
        type: "GET",
        data: { pageNumber: pageNumber, pageSize: pageSize, searchTerm: searchTerm },
        success: function (response) {
            $("#ModifersListToEditModiferGroupContainer").html(response);
            $("#AllModifierForEditPerPage").val(pageSize);
            $(".allmodifiereditpagination-link").removeClass("active");
            $(".allmodifiereditpagination-link[data-page='" + pageNumber + "']").addClass("active");


            $(".allmodifieredit-checkbox").each(function () {
                let modifierId = $(this).val().toString();
                $(this).prop("checked", selectedModifiersForEdit.has(modifierId)); // Automatically check if selected
            });
        },
        error: function () {
            toastr.error("Error fetching modifiers.");
        }
    });
}

$(document).on("change", ".allmodifieredit-checkbox", function () {
    let modifierId = $(this).val();
    let modifierName = $(this).data("name");

    if ($(this).is(":checked")) {
        selectedModifiersForEdit.set(modifierId, modifierName);
    } else {
        selectedModifiersForEdit.delete(modifierId);
        $(`#selectedModifierForEdit_${modifierId}`).remove();
    }
});


$(document).on("click", ".allmodifiereditpagination-link", function (e) {
    e.preventDefault();
    let pageNumber = $(this).data("page");
    let pageSize = $("#AllModifierForEditPerPage").val();
    loadAllModifierssForEdit(pageNumber, pageSize);
});


$(document).on("change", "#AllModifierForEditPerPage", function () {
    loadAllModifierssForEdit(1, $(this).val());
});


$("#EditModifiersBtn").on("click", function () {
    $("#selectedEditModifiersContainer").empty();

    selectedModifiersForEdit.forEach((modifierName, modifierId) => {
        if ($(`#selectedModifierForEdit_${modifierId}`).length === 0) {
            $("#selectedEditModifiersContainer").append(`
                <span class="btn btn-light p-2 me-2 selected-modifieredit" id="selectedModifierForEdit_${modifierId}" data-id="${modifierId}">
                    ${modifierName} <span class="remove-modifier" style="cursor:pointer;">&times;</span>
                </span>
            `);
        }
    });
    console.log("modifer id for edit", selectedModifiersForEdit);

    $("#selectExistingModifierForEditModal").modal("hide");
    setTimeout(() => {
        $("#EditModifierGroupModal").modal("show");
    }, 500);
});


$(document).on("click", ".remove-modifier", function () {
    let modifierId = $(this).parent().data("id");

    let modifierKey = modifierId.toString();

    if (selectedModifiersForEdit.has(modifierKey)) {
        selectedModifiersForEdit.delete(modifierKey);
    }
    $(this).parent().remove();


    $(".allmodifieredit-checkbox").each(function () {
        if ($(this).val() === modifierId) {
            $(this).prop("checked", false);
        }
    });
});


$(document).on("click", "#openExistingModifierEditModal", function () {
    loadAllModifierssForEdit(1, 5, "");
});


/// get modifier in item 


$(document).ready(function () {
    var selectedGroupsForItem = new Set();

    $("#modifierGroupDropdownForItem").change(function () {
        var groupId = $(this).val();
        var groupName = $("#modifierGroupDropdownForItem option:selected").text();

        if (!groupId) return;

        groupId = groupId.toString();

        if (selectedGroupsForItem.has(groupId)) {
            toastr.warning(groupName + " is already added.");
            return;
        }

        $.ajax({
            url: '/Menu/GetModifierGroupForItem',
            type: 'GET',
            data: { groupId: groupId },
            success: function (data) {
                var modifierGroupHtml = $(data).attr("data-group-id", groupId);
                $(".modifierContainer").append(modifierGroupHtml);
                selectedGroupsForItem.add(groupId);
                $("#modifierGroupDropdownForItem").val(""); 
            },
            error: function () {
                alert("Failed to load modifier group.");
            }
        });
    });

    
    $(document).on("click", ".remove-group", function () {
        var groupElement = $(this).closest(".modifier-group");
        var groupId = groupElement.attr("data-group-id"); 

        selectedGroupsForItem.delete(groupId);
        groupElement.remove();
    });
});


