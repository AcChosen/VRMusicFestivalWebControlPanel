// function printMessage(){
//     console.log("Output!");
// }

function DisableButtons(status)
{
    $("#submitChanges").attr("disabled", status);
}

function FireSubmitToast(message)
{
    let id = '#f'+ 5;
    let myAlert = $(id+'-toast');
    myAlert.css('background-color', ColorLuminance("#07762A",0));
    let bsAlert = new bootstrap.Toast(myAlert);
    $(id+'-toastTarget').text(message);
    bsAlert.show();
}

function ResolveAfterProperResponse(resolve, reject)
{
    setTimeout(() => {
    $.ajax({
        url:'/checkGithubStatus', //home url
        type:'POST',
        data: 'Get Status Please',
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            // $("#pinwheel").show();
            let status = response
            console.log("Is Finished Waiting On Github?: " + status.Message);
            if(status.Message !== "False")
            {
                //reject("Still Waiting On Github...");
                ResolveAfterProperResponse(resolve); // Try Again
            }
            else
            {
                resolve("True");
            }
            //console.log(response);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);
                reject("Error Occured");  }
    })
    
    }, 2500);
}

function CheckGithubStatus(data)
{
    // const status = await ResolveAfterProperResponse();
    // if(status === "true")
    // {
    //     $("#pinwheel").hide();
    // }
    new Promise((r, j) =>{
        ResolveAfterProperResponse(r, j);
    }).then((result)=>
    {
        $('.pinwheel').each(function(h,e){$(this).hide();})
        DisableButtons(false);
        FormatDataIntoHTMLElement($("#currentDataPreview"), data);
        FireSubmitToast("Data Succesfully Uploaded and Live!")


    });
    // console.log("Testing Async Function");
}


function SetupButtons(data)
{
    $('.fButton').each(function(h,e)
    {
        let id = '#f'+ h;
        let q = h + 1;
        $(this).hover(function(){
            $(this).css('background-color', ColorLuminance($(id+'-color').val(),-0.5));},
            function(){
            $(this).css('background-color', $(id+'-color').val());
        })

        $(this).mousedown(function(){
            $(this).css('background-color', ColorLuminance($(id+'-color').val(),1.5));
        })

        $(this).mouseup(function(){
            $(this).css('background-color', ColorLuminance($(id+'-color').val(),-0.5));
        })

        $(this).click(function(){
            let myAlert = $(id+'-toast');
            myAlert.css('background-color', ColorLuminance($(id+'-color').val(),-0.15));
            let bsAlert = new bootstrap.Toast(myAlert);
            let x = $(id+'-btnNotes').val() === "" ? "Button " + q + " has been clicked!" : $(id+'-btnNotes').val();
            $(id+'-toastTarget').text(x);
            bsAlert.show();

            UpdateNewData(id, data);
        })
    });

    $('.fClear').each(function(h,e)
    {
        let id = '#f'+ h;
        let q = h + 1;
        let bg = $(this).css('background-color');
        $(this).hover(function(){
            
            $(this).css('background-color', ColorLuminance(bg,-0.25));},
            function(){
            $(this).css('background-color', bg);
        })

        $(this).mousedown(function(){
            $(this).css('background-color', ColorLuminance(bg,0.5));
        })

        $(this).mouseup(function(){
            $(this).css('background-color', ColorLuminance(bg,-0.25));
        })
        $(this).click(function()
        {
            ClearDataEntry($(id+'-name').val(), data);
        })
    });
}

function SubmitData()
{
    
    jQuery.ajaxSetup({ async: false }); 
    $.ajax({
        url:'/worlddatasubmit', //home url
        type:'POST',
        data: 'Submit Data!',
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            $('.pinwheel').each(function(h,e){$(this).show();})
            DisableButtons(true);
            
            //console.log(response);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);  }
    })
    var data = {}
    $.ajax({
        url:'/worlddatasubmit', //home url
        type:'GET',
        dataType: 'json',
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            data = response
            
            CheckGithubStatus(data);
            //$('.pinwheel').each(function(h,e){$(this).hide();})
            //console.log(response);
            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);
            FormatDataIntoHTMLElement($("#currentDataPreview"), data);  
        }
    })
        
}
function ResetData(rows, columns, panelDataJSON, newStringDataJSON)
{
    var data = {}
    $.ajax({
        url:'/worlddatareset', //home url
        type:'GET',
        dataType: 'json',
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            data = response;
            if(data === undefined)
            {
                data = {};
            }
            FormatDataIntoHTMLElement($("#newDataPreview"), data);
            SetupButtons(data);
            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);  }
    })
        
}

function ClearAllData(rows, columns, panelDataJSON, newStringDataJSON)
{
    var data = {}
    $.ajax({
        url:'/worlddataclear', //home url
        type:'GET',
        dataType: 'json',
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            data = response;
            console.log(data);
            FormatDataIntoHTMLElement($("#newDataPreview"), data);
            SetupButtons(data);
            
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);  }
    })
        
}

function PostData(data)
{
    $.ajax({
        url:'/worlddata', //home url
        type:'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify(data),
        statusCode: {
            200: () => console.log("sucess!"),
            304: () => console.log(""),
            418: () => console.log("This is a teapot!") 
        },
        success: function(response){
            FormatDataIntoHTMLElement($("#newDataPreview"), data);
            //console.log(response);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown)
            { console.log("Error: " + errorThrown);  }
    })
        
}

function ClearDataEntry(name, data)
{
    // data.forEach((item, index) =>
    // {
    //     let key = Object.keys(item)[0];
    //     if(key === name)
    //     {
    //         data.splice(index,1);
    //         PostData(data);
    //         return true;
    //     }
    // });
    if(name in data)
    {
        delete data[name];
        PostData(data);
        return true;
    }
        
}

function FormatDataIntoHTMLElement(element, rawData)
{
    //var lines = rawData.split('\n');
    data = '';
    //console.log("Keys: " + k.toString())
    if(rawData === {})
    {
        element.empty();
        element.append(data);
    }
    else
    {
        for(const key in rawData)
        {
            var name = key;
            var value = rawData[key].Value;
            var type = rawData[key].Type;
            name = '<span class="dataVariableName">' + name + '</span>';
            
            switch(type)
            {
                case "bool":
                    value = value == 'true';
                    value = value === false ? '<span class="dataVariableFalse datavariableValue">' + value.toString().toUpperCase() + '</span>' : '<span class="dataVariableTrue datavariableValue">' + value.toString().toUpperCase() + '</span>';
                    break;
                case "int":
                    value = '<span class="dataVariableInt datavariableValue">' + value + '</span>';
                    break;
                case "float":
                    value = '<span class="dataVariableFloat datavariableValue">' + value + '</span>';
                    break;
                case "string":
                    value = '<span class="dataVariableString datavariableValue">' + "\""+ value + "\""+ '</span>';
                    break;
                case "event":
                    value ='<span class="dataVariableFire">' + 'FIRING AFTER... ' + '</span>'+ '<span class="datavariableValue">' + value + ' seconds' + '</span>';
                    break;
                default:
                    value = '<span>' + value + '</span>';
                    break;
            }
            if(type === "event")
            {
                data += name + ': ' + value + '\n';
            }
            else
            {
                data += name + ' = ' + value + '\n';
            }
        }
        element.empty();
        element.append(data);
    }
}

function UpdateNewData(id, newStringData)
{
   //console.log(newStringData);
   jQuery.ajaxSetup({ async: false });
   let kLength = 0;
   let rawData = newStringData;
   console.log(rawData);
   //console.log(typeof rawData);

//    if(rawData.length >= 1)
//    {
//         kLength = Object.keys(rawData[0]).length;
//    }
//    else
//    {
//         return;
//    }


//    if((rawData.length === 1 && kLength === 0))
//    {
//         var x = rawData.pop()
//    }
   let data = rawData;

   let variableName =  $(id+'-name').val();
   if(variableName === "")
   {
        return;
   }
   let vType = $(id+'-type').val();
   let vValue = '';
   switch(vType)
   {
       case "bool":
           vValue = $(id+'-bValue').is(':checked');
           vValue = vValue.toString();
           //vValue = vValue.toString() === "true" ? '<span class="dataVariableTrue datavariableValue">' + vValue + '</span>' : '<span class="dataVariableFalse datavariableValue">' + vValue + '</span>';
           break;
       case "int":
           vValue = parseInt($(id+'-nValue').val());
           break;
       case "float":
           vValue = parseFloat($(id+'-nValue').val());
           break;
       case "string":
           vValue = $(id+'-sValue').val();
           break;
       case "event":
           vValue = parseFloat($(id+'-nValue').val());
           break;
       default:
           vValue = "ERROR";
           break;
   }
   if(vType === "default")
   {
        return;
   }
//    let w = data.length;
//    console.log(data);
    let repl = undefined;
    //console.log(variableName);
    // data.forEach((item, index) =>
    // {
    //     let key = Object.keys(item)[0];
    //    // console.log(key);
    //     if(key === variableName)
    //     {
    //         console.log("Found Match!");
    //         repl = item;
            
    //         repl = 
    //         {
    //             //Name: variableName,
    //             Type: vType,
    //             Value: vValue
    //         };
    //         data[index][variableName] = repl;
    //         PostData(data);
    //         return;
    //     }
    //     //console.log(variableName);
    // });
    // if(variableName in data)
    // {
    //     data[variableName] = {
    //                     //Name: variableName,
    //                     Type: vType,
    //                     Value: vValue
    //                             };
    // }
    // else
    // {
    //     data[variableName]
    //    // data.push(finalDataEntry);
    // }
    data[variableName] = 
                {
                //Name: variableName,
                Type: vType,
                Value: vValue
                };
    PostData(data);
}

function SaveJSONData(rows, columns)
{
    jQuery.ajaxSetup({ async: true });
    let buttonData = [];
        let rc =
        {
            rows: parseInt(rows),
            columns: parseInt(columns)
        }
        buttonData.push(rc);
        $('.fButton').each(function(h,e)
        {
            let id = '#f'+ h;
            let vType = $(id+'-type').val();
            let vValue = "ERROR";
            switch(vType)
            {
                case "bool":
                    vValue = $(id+'-bValue').is(':checked');
                    break;
                case "int":
                    vValue = parseInt($(id+'-nValue').val());
                    break;
                case "float":
                    vValue = parseFloat($(id+'-nValue').val());
                    break;
                case "string":
                    vValue = $(id+'-sValue').val();
                    break;
                case "event":
                    vValue = parseFloat($(id+'-nValue').val());
                    break;
                default:
                    vValue = "ERROR";
                    break;
            }
            let btn = 
            {
                buttonID: h,
                buttonName: $(id+'-btnName').val(),
                buttonNotes: $(id+'-btnNotes').val(),
                buttonColor: $(id+'-color').val(),
                buttonLock: $(id+'-lock').is(':checked'),
                variableName: $(id+'-name').val(),
                variableType: vType,
                variableValue: vValue
            }
            buttonData.push(btn);
        });
        //console.log(JSON.stringify(buttonData, '\t', 2));
        $.ajax({
            url:'/world', //home url
            type:'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(buttonData),
            statusCode: {
                200: () => console.log("sucess!"),
                304: () => console.log(""),
                418: () => console.log("This is a teapot!") 
            },
            success: function(response){
                //console.log(response);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown)
                { console.log("Error: " + errorThrown);  }
        })
}

function SetValueType(id, val)
{
    switch(val)
    {
        case "bool":
            $(id+'-name').attr("placeholder", "Variable Name");
            $(id+'-name-l').text("Variable Name:");
            $(id+'-nValue').attr("placeholder", "Value");
            $(id+'-nValue').attr("min", "");
            $(id+'-value-l').text("Value:");
            $(id+'-sValue').hide();
            $(id+'-value-l').hide();
            $(id+'-nValue').hide();
            $(id+'-bValue').show();
            $(id+'-bValue-l').show();

            $(id+'-boolSpace').show();
            $(id+'-boolSpace2').show();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})
            break;
        case "int":
            $(id+'-name').attr("placeholder", "Variable Name");
            $(id+'-nValue').attr("placeholder", "Value");
            $(id+'-nValue').attr("min", "");
            $(id+'-name-l').text("Variable Name:");
            $(id+'-value-l').text("Value:");
            $(id+'-sValue').hide();
            $(id+'-value-l').show();
            $(id+'-nValue').val(function(index, currValue){return currValue.replace(".","")});
            $(id+'-nValue').keypress(function(e){return (e.charCode >= 48 && e.charCode <= 57) || e.charCode == 45})
            $(id+'-nValue').show();
            $(id+'-bValue').hide();
            $(id+'-bValue-l').hide();
            
            $(id+'-boolSpace').hide();
            $(id+'-boolSpace2').hide();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})
            break;
        case "float":
            $(id+'-name').attr("placeholder", "Variable Name");
            $(id+'-nValue').attr("placeholder", "Value");
            $(id+'-nValue').attr("min", "");
            $(id+'-name-l').text("Variable Name:");
            $(id+'-value-l').text("Value:");
            $(id+'-nValue').off("keypress");
            $(id+'-sValue').hide();
            $(id+'-value-l').show();
            $(id+'-nValue').show();
            $(id+'-bValue').hide();
            $(id+'-bValue-l').hide();
                            
            $(id+'-boolSpace').hide();
            $(id+'-boolSpace2').hide();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})
            break;
        case "string":
            $(id+'-name').attr("placeholder", "Variable Name");
            $(id+'-nValue').attr("placeholder", "Value");
            $(id+'-name-l').text("Variable Name:");
            $(id+'-value-l').text("Value:");
            $(id+'-sValue').show();
            $(id+'-value-l').show();
            $(id+'-nValue').hide();
            $(id+'-bValue').hide();
            $(id+'-bValue-l').hide();
                            
            $(id+'-boolSpace').hide();
            $(id+'-boolSpace2').hide();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})
            break;
        case "event":
            $(id+'-name').attr("placeholder", "Event Name");
            $(id+'-nValue').attr("placeholder", "Delay");
            $(id+'-nValue').attr("min", "0");
            $(id+'-name-l').text("Event Name:");
            $(id+'-value-l').text("Delay:");
            $(id+'-nValue').val(function(index, currValue){return currValue.replace("-","")});
            $(id+'-nValue').keypress(function(e){return e.charCode != 45})
            
            $(id+'-sValue').hide();
            $(id+'-value-l').show();
            $(id+'-nValue').show();
            $(id+'-bValue').hide();
            $(id+'-bValue-l').hide();
                            
            $(id+'-boolSpace').hide();
            $(id+'-boolSpace2').hide();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})

            break;
        default:
            $(id+'-name').attr("placeholder", "Variable Name");
            $(id+'-name-l').text("Variable Name:");
            $(id+'-nValue').attr("min", "");
            $(id+'-nValue').attr("placeholder", "Value");
            $(id+'-value-l').text("Value:");
            $(id+'-sValue').hide();
            $(id+'-value-l').hide();
            $(id+'-nValue').hide();
            $(id+'-bValue').hide();
            $(id+'-bValue-l').hide();
                            
            $(id+'-boolSpace').hide();
            $(id+'-boolSpace2').hide();

            $(id+'-sValue').keypress(function(e){return e.charCode != 34})
            $(id+'-name').keypress(function(e){return e.charCode != 34})
            $(id+'-btnName').keypress(function(e){return e.charCode != 34})
            $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
            $(id+'-nValue').keypress(function(e){return e.charCode != 34})
    }
}

function ColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    // convert to decimal and change luminosity
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i*2,2), 16);
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
        rgb += ("00"+c).substr(c.length);
    }
    return rgb;
}

function ColorButton(buttonClass, col)
{
    $(buttonClass).each(function(h,e)
    {
        let color = col;
        $(this).css("background-color", color);
        
        $(this).hover(function(){
            $(this).css('background-color', ColorLuminance(color,-0.5));},
            function(){
            $(this).css('background-color', color);
        })

        $(this).mousedown(function(){
            $(this).css('background-color', ColorLuminance(color,1.01));
        })

        $(this).mouseup(function(){
            $(this).css('background-color', ColorLuminance(color,-0.5));
        })
    });
}

function UpdateButtons(rows, columns, panelDataJSON, newStringData)
{
    jQuery.ajaxSetup({ async: false }); //if order matters
    // $.get("button.html", '', function (data) { $("#buttonSet").append(data); });
    let d ='';
    let toastText = '';
    $.get("button.html", '', function (data) { d = data; });
    $.get("toast.html", '', function (data) { toastText = data; });
    let b = d;
    let toastTextb = toastText;
    d ='';
    toastText = '';
    let counter = 0;
    for(let i = 0; i < rows; i++)
    {
        d += '<div class ="row" id =r-' + i + '>';
        for(let j = 0; j < columns; j++)
        {
            counter++;
            id = counter - 1;
            d += '<div class ="col" id =c-' + id + '>';
            let q = b;
            q = q.replace(/f1/g, "f" + id);
            d += q;
            d+='</div>';

            let toastTextq = toastTextb;
            toastTextq = toastTextq.replace(/f1/g, "f" + id);
            toastText +=toastTextq;
        }
        d += '</div>';
    }
    $("#buttonSet").append(d);
    $("#toastHolder").append(toastText);
    //console.log("Counter: " + counter);


    defaultButtonColor = "#454040";
    defaultButtonName = "Update Variable"

    for(let h = 0; h < counter; h++)
    {
        id = '#f'+ h;
        pd = h + 1;
        $(id+'-sValue').hide();
        $(id+'-nValue').hide();
        $(id+'-bValue').hide();
        $(id+'-bValue-l').hide();
        $(id+'-editDiv').hide();
        $(id+'-value-l').hide();                   
        $(id+'-boolSpace').hide();
        $(id+'-boolSpace2').hide();

        $(id+'-sValue').keypress(function(e){return e.charCode != 34})
        $(id+'-name').keypress(function(e){return e.charCode != 34})
        $(id+'-btnName').keypress(function(e){return e.charCode != 34})
        $(id+'-btnNotes').keypress(function(e){return e.charCode != 34})
        $(id+'-nValue').keypress(function(e){return e.charCode != 34})

        

        try
        {
            $(id+'-btnNotes').val(panelDataJSON[pd].buttonNotes);
        }
        catch(err)
        {
            $(id+'-btnNotes').val("");
        }

        
        try
        {
            $(id+'-lock').prop('checked', panelDataJSON[pd].buttonLock);
        }
        catch(err)
        {
            $(id+'-lock').prop('checked', false);
        }
        var val = $(id+'-lock').is(':checked');
        $(id+'-btnName').prop("disabled", val);
        $(id+'-name').prop("disabled", val);
        $(id+'-type').prop("disabled", val);
        $(id+'-color').prop("disabled", val);
        $(id+'-btnNotes').prop("disabled", val);
        

        let defaultbtnName = defaultButtonName + " " + pd;
        try
        {
            $(id+'-btnName').val(panelDataJSON[pd].buttonName);
        }
        catch(err)
        {
            $(id+'-btnName').val(defaultbtnName);
        }
        
        try
        {
            $(id+'-name').val(panelDataJSON[pd].variableName);
        }
        catch(err)
        {
            $(id+'-name').val("");
        }

        try
        {
            $(id+'-type').val(panelDataJSON[pd].variableType);
        }
        catch(err)
        {
            $(id+'-type').val("default");
        }

        try
        {
            let val = panelDataJSON[pd].variableValue;
            let type = $(id+'-type').find(":selected").val();
            switch(type)
            {
                case "bool":
                    $(id+'-bValue').prop('checked', val);
                    break;
                case "int":
                    $(id+'-nValue').val(val);
                    break;
                case "float":
                    $(id+'-nValue').val(val);
                    break;
                case "string":
                    $(id+'-sValue').val(val);
                    break;
                case "event":
                    $(id+'-nValue').val(val);
                    break;
                default:
                    $(id+'-nValue').val(0);
                    $(id+'-sValue').val("");
                    $(id+'-bValue').val(false);
                    break;
            }
            SetValueType(id, type);
        }
        catch(err)
        {
            $(id+'-nValue').val(0);
            $(id+'-sValue').val("");
            $(id+'-bValue').val(false);
        }

        

        try
        {
            $(id+'-color').val(panelDataJSON[pd].buttonColor);
        }
        catch(err)
        {
            $(id+'-color').val(defaultButtonColor);
        }



        $(id+'-button').text($(id+'-btnName').val());
        $(id+'-button').css('background-color', $(id+'-color').val());
    }


    SetupButtons(newStringData);

    $('.fButtonColor').each(function(h,e)
    {
        let id = '#f'+ h;
        $(this).on("change click mousemove", function(){
            $(id+'-button').css('background-color', $(this).val());
        })
    });

    $('.fButtonName').each(function(h,e)
    {
        let id = '#f'+ h;
        $(this).on('change keyup paste', function(){
            $(id+'-button').text($(id+'-btnName').val());
        });
    });

    $('.fLock').each(function(h,e)
    {
        let id = '#f'+ h;
        $(this).click(function(){
            var val = $(this).is(':checked');
            $(id+'-btnName').prop("disabled", val);
            $(id+'-name').prop("disabled", val);
            $(id+'-type').prop("disabled", val);
            $(id+'-color').prop("disabled", val);  
            $(id+'-btnNotes').prop("disabled", val);   
        });
    
    });

    $('.fEditMode').each(function(h,e)
    {
        let id = '#f'+ h;
        $(this).click(function(){
            if($(id+"-editMode").is(':checked')){
                $(id+'-editDiv').fadeIn(150);
            }
            else{
                $(id+'-editDiv').fadeOut(150);
            }
        });
    });

    $('.fType').each(function(h,e)
    {
        let id = '#f'+ h;
        $(this).on('change',function()
        {
            var val = $(this).val();
            SetValueType(id, val);
            
        })
    });

    $('.panelUpdater').each(function(h,e)
    {
        $(this).on('change paste', function(){
            SaveJSONData(rows,columns);
        });
    })
}

(function ($, log) {

$(document).ready(function() {

    $('.pinwheel').each(function(h,e){$(this).hide();})
    DisableButtons(false);

    panelDataJSON = JSON.parse(pd);

    let rows = panelDataJSON[0].rows;
    let columns = panelDataJSON[0].columns;

    $("#rowCounter").val(rows);
    $("#colCounter").val(columns);

    log(panelDataJSON);

    newStringDataJSON = JSON.parse(nd);
    // console.log("Here is the new Data!");
    // console.log(newStringDataJSON);
    //ndJSRaw = ndJSRaw.replaceAll('%^$', '\n');
    FormatDataIntoHTMLElement($("#newDataPreview"), newStringDataJSON);
    currentStringDataJSON = JSON.parse(cd);
    //cdJSRaw = cdJSRaw.replaceAll('%^$', '\n');
    FormatDataIntoHTMLElement($("#currentDataPreview"), currentStringDataJSON);

    $("#submitChanges").click(function()
    {
        FireSubmitToast("Submitting to Pages...")
        SubmitData();
    })
    $("#resetChanges").click(function()
    {
        ResetData(rows, columns, panelDataJSON, newStringDataJSON);
    })
    $("#clearallbtn").click(function()
    {
        ClearAllData(rows, columns, panelDataJSON, newStringDataJSON);
    })

    
    $("#rowCounter").on('change keyup paste submit keydown click',function(){
        $("#buttonSet").empty();
        rows = $("#rowCounter").val();
        UpdateButtons(rows, columns, panelDataJSON, newStringDataJSON);
        jQuery.ajaxSetup({ async: true });
        SaveJSONData(rows,columns);
    })
    $("#colCounter").on('change keyup paste submit keydown click',function(){
        $("#buttonSet").empty();
        columns = $("#colCounter").val();
        UpdateButtons(rows, columns, panelDataJSON, newStringDataJSON);
        jQuery.ajaxSetup({ async: true });
        SaveJSONData(rows,columns);
    })
    UpdateButtons(rows, columns, panelDataJSON, newStringDataJSON);
    ColorButton('.submitBtn',"#07762A");
    ColorButton('.clearAllBtn',"#D03E40");
    ColorButton('.resetBtn',"#787878");
    ColorButton('.saveButton',"#454040");
    let form = document.querySelector('form');

    $("#forceSave").click(function(){
        SaveJSONData(rows,columns);
    })



    //$("#currentDataPreview").text(cdJSRaw);
    // $("#submitChanges").on('click', function()
    // {
    //     SaveJSONData(rows,columns);
    // })
    // $('.panelUpdater').each(function(h,e)
    // {
    //     $(this).on('change paste', function(){
    //         SaveJSONData(rows,columns);
    //     });
    // })



});
})(jQuery, console.log);