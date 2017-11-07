    var $grid;
    var node;
    var nodes;
    var firstLoad = true;
    var iconBreadcrumb = false;
    var editButtons = false;
    var layoutToggle = true;
    var editMode = true;
    var iconSelect = false;
    var fromAddNode = false;
    var menuOpenClosed = false;
    // var iconBreadcrumb = false;
    // var editButtons = false;
    // var layoutToggle = true;
    // var linkToggle = true;
    var selectedIcon = null;
    var columns = [];
    var currentCol = 0;
    //var layoutType = "column";
    var rootColumn = [];
    var breadCrumb = [];
    var breadcrumbNav = "";
    var undoStates = [];
    var undo = false;
    var leftMenuToggleSelector = "#toggle-menu";
    var JSONtree;
    var openFile;

    var mapName =  window.location.hash.substr(1);

    var newJSON = [{ "id":"root","text" : "Root", "icon":"column", "children" : [ ]}];

    
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };


    $(document).ready(function(){
            //if there is a # with landingpage name after it in the URL then load it. Otherwise, load default.js layout
            if(mapName.length > 0){
                setTimeout(loadJSON, 1000);
            }else{
                setTimeout(renderLayout, 1000);
            }

            $('#all-icons').css("display", "none");

            $("#root_anchor").off('click');
        

            if(lockApplication){
                leftMenuToggleSelector = "";
            }

            var settings = {
            // toggle: leftMenuToggleSelector, // the selector for the menu toggle, whatever clickable element you want to activate or deactivate the menu. A click listener will be added to this element.
            exit_selector: ".exit", // the selector for an exit button in the div if needed, when the exit element is clicked the menu will deactivate, suitable for an exit element inside the nav menu or the side bar
            animation_duration: "0.5s", //how long it takes to slide the menu
            place: "left", //where is the menu sliding from, possible options are (left | right | top | bottom)
            animation_curve: "cubic-bezier(0.54, 0.01, 0.57, 1.03)", //animation curve for the sliding animation
            body_slide: true, //set it to true if you want to use the effect where the entire page slides and not just the div
            no_scroll: false //set to true if you want the scrolling disabled while the menu is active
            };

            menu = $('#menu').sliiide(settings); //initialize sliiide

            //var menu = $('.menu').sliiide({place: 'right', exit_selector: '.exit', toggle: '#toggle-menu,        no_scroll: true, body_slide: true'});

            $('#toggle-menu').click(function(){
                console.log("clicked");
                if(!lockApplication){
                    menu.activate();
                }

                menuOpenClosed = !menuOpenClosed;

                if(menuOpenClosed){
                    $(".nav").show();
                    $("#menu").show();
                }

                setTimeout(unlockMenu, 1000);
            });

            function unlockMenu(){

            }

            //menu.activate(); //slides the menu open
            // menu.deactivate(); //slides the menu closed
            //menu.reset(); //removes all the css that sliiide added to any element

            $('#menu').find('.accordion-toggle').click(function(){

                //Expand or collapse this panel
                $(this).next().slideToggle('fast');

                //Hide the other panels
                //$(".accordion-content").not($(this).next()).slideUp('fast');

            });

            $('.toggle').toggles({clicker:$('.editButtons')});
            if(editButtons){$('.linkToggle').click()};
            $('.toggle').click(function(){
                editButtons = !editButtons;
                
            });


            $('.layoutToggle').toggles({clicker:$('.layoutToggleButton')});
            if(layoutToggle){$('.linkToggle').click()};
            $('.layoutToggle').click(function(){
                layoutToggle = !layoutToggle;

                if(layoutToggle){
                    layoutType = "column";
                }else{
                    layoutType = "row";
                }

                renderLayout();
                
            });

            $('.iconBreadcrumbToggle').toggles({clicker:$('.iconBreadcrumbToggle')});
            if(iconBreadcrumb){$('.linkToggle').click()};
            $('.iconBreadcrumbToggle').click(function(){
                iconBreadcrumb = !iconBreadcrumb;

                renderLayout();
                
            });

            $('.linkToggle').toggles({clicker:$('.linkToggleButton')});
            if(linkToggle){$('.linkToggle').click()};
            $('.linkToggle').click(function(){
                linkToggle = !linkToggle;
            });

            $('.render').click(function() {
                renderLayout();
            });


            $(document).on("click", '.cancel', function() {
                iconSelect = false;
                $('#top').css("display", "block");
                $('#all-icons').css("display", "none");
            });

            $('.closeScreenshot').click(function() {
                iconSelect = false;
                $('#container').css("display", "block");
                $('#screenshot').css("display", "none");
            });

            $('.top-btn').click(function() {
                columns.pop();
                breadCrumb.pop();
                renderLayout();
            });

            $('.home-btn').click(function() {
                rootColumn = [];  
                breadCrumb = [];
                columns = [];
                breadcrumbNav = "";
                $("#breadcrumb").html(breadcrumbNav);
                renderLayout();
                columns = [];
            });

            function goHome() {
                rootColumn = [];  
                breadCrumb = [];
                columns = [];
                breadcrumbNav = "";
                $("#breadcrumb").html(breadcrumbNav);
                renderLayout();
                columns = [];
            }

            $('.saveJSON').click(function() {
                var treejson = $('#menuTree').data().jstree.get_json();
                var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(treejson));

                var $textAndPic = $('<div id="saveModal"></div>');
                $textAndPic.append('<input id="saveJSONInput" type="text" value="Enter file name here"><a id="saveFileName" href="data:' + data + '" download=""><button>download</button></a>');

                BootstrapDialog.show({
                            title: 'Download layout file',
                            message: $textAndPic,
                            buttons: [{
                                label: 'Close',
                                action: function(dialogRef){
                                    dialogRef.close();
                                }
                            }]
                });

                //$('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#menu');
            });

            $(document).on("keyup", "#saveJSONInput", function() {
                $('#saveFileName').attr("download", $('#saveJSONInput').val()+'.js');
            });

            $('.saveDefaultJSON').click(function() {
                var treejson = $('#menuTree').data().jstree.get_json();
                var data = "text/json;charset=utf-8," + encodeURIComponent("var JSONtree = " + JSON.stringify(treejson) + ";");

                var $textAndPic = $('<div></div>');
                $textAndPic.append('<a href="data:' + data + '" download="default.js">Download default layout JS file and place in same folder as index.html</a>');

                BootstrapDialog.show({
                            title: 'Download default layout file',
                            message: $textAndPic,
                            buttons: [{
                                label: 'Close',
                                action: function(dialogRef){
                                    dialogRef.close();
                                }
                            }]
                });

                //$('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#menu');
            });

            $('.loadJSON').click(function() {
                // var element = document.createElement('div');
                // element.innerHTML = '<input type="file">';
                // var fileInput = $('#fileUpload');  //element.firstChild;

                // fileInput.change(function() {
                //     console.log(fileInput.files);
                //     var file = fileInput.files[0];

                //     if (file.name.match(/\.(txt|json)$/)) {
                //         var reader = new FileReader();

                //         reader.onload = function() {
                //             console.log(reader.result);
                //         };

                //         reader.readAsText(file);    
                //     } else {
                //         alert("File not supported, .txt or .json files only");
                //     }
                // });

                //fileInput.click();


                // var treejson = $('#menuTree').data().jstree.get_json();
                

                BootstrapDialog.show({
                    message: 'Paste JSON layout here: <input type="text" class="form-control">',
                    buttons: [{
                        label: 'Load',
                        action: function(dialogRef) {
                            JSONtree = dialogRef.getModalBody().find('input').val();
                          
                            $('#menuTree').jstree(true).settings.core.data = JSON.parse(JSONtree);
                            $('#menuTree').jstree(true).refresh(); 

                             
                            dialogRef.close();


                            //renderLayout(jsonToLoad);
                            //initTree(jsonToLoad);
                            //renderLayout();
                            
                            // var jsTreeSettings = $("#menuTree").jstree("get_settings");
                            // jsTreeSettings.json_data.data = $.parseJSON(jsonToLoad);
                            // $.jstree._reference("menuTree")._set_settings(jsTreeSettings);

                            // Refresh whole our tree (-1 means root of tree)
                            //$.jstree._reference("menuTree").refresh(-1);
                            //$('#menuTree').data().jstree.set_json(jsonToLoad);
                            
                        }
                    },{
                        label: 'Close',
                        action: function(dialogRef) {
                            dialogRef.close();
                        }
                    }]
                });

            });

            $('.undo').click(function() {
                
                    if(undoStates.length > 0){
                          
                        undo = true;
                        $('#menuTree').jstree(true).settings.core.data = undoStates.pop(); 
                        $('#menuTree').jstree(true).refresh(); 
                    }
            });

            $(document).on("click",'.saveLink', function() {
                console.log("savelink "+selectedID);
                //var nodes = $('#menuTree').data().jstree.get_json();
                var nodes = $('#menuTree').jstree(true);

                var getInputURL = $('#buttonURL').val();
                
                var returnedObj = findAndReplaceLink(nodes, selectedID, getInputURL);
                foundKey = false;
                iconSelect = false;
                $('#menuTree').jstree(true).settings.core.data = nodes;
                // if(columns.length > 0){
                //     renderLayout(columns);
                // }else{
                //     renderLayout();
                // }

                // $('#top').css("display", "block");
                // $('#all-icons').css("display", "none");
            });

             $(document).on("click",'.clearLink', function() {
                console.log("clear link");
                var nodes = $('#menuTree').jstree(true);
                var getInputURL = "";
                var returnedObj = findAndReplaceLink(nodes, selectedID, getInputURL);
                foundKey = false;
                //iconSelect = false;
                $('#buttonURL').val("");
                //$('.saveLink').click();
                $('#menuTree').jstree(true).settings.core.data = nodes;
                //$('#all-icons').hide();

                // if(columns.length > 0){
                //     renderLayout(columns);
                // }else{
                //     renderLayout();
                // }
            });

        
            $(document).on("click", ".addLinkList", function() {
                var nodes = $('#menuTree').jstree(true);

                var newNode = {"id":Math.random()*10000000, "text":"new node", "icon":"globe", a_attr:{}};
                newNode.a_attr.href = nodes.get_node(selectedID).a_attr.href;

                $('#menuTree')
                .jstree({
                    "core": {
                        "check_callback" : true
                    }
                })
                .create_node(selectedID, newNode);

                fromAddNode = true;
                
                var returnedObj = findAndReplaceLink(nodes, selectedID, "links");
                $('#menuTree').jstree(true).settings.core.data = nodes;
                editMultiple(selectedID);
                $("#singleLink").hide();
                $("#editMultipleLinks").show();


                var path = $('#menuTree').data().jstree.get_path(selectedID, "/", true);
                path = path.split('/');
                var nodeIndex = path.indexOf(selectedID) - 1;
                nodexIndex = (nodeIndex < 0 ) ? 0 : nodeIndex;
                $("#"+path[nodeIndex]+"_anchor").click();
            });

            $(document).on("click", ".removeLinkList", function() {
                var nodes = $('#menuTree').jstree(true);
                var nodes2 = $('#menuTree').data().jstree.get_json();
                //var returnedNode = nodes.get_node(nodeID);

                node = getObjects(nodes2, "id", selectedID);
                node = node[0];

                for (var i = 0; i < node.children.length; i++) {
                    console.log("delete " + node.children[i].id);
                    nodes.delete_node(node.children[i].id);
                }

                var returnedObj = findAndReplaceLink(nodes, selectedID, "");
                $('#menuTree').jstree(true).settings.core.data = nodes;
                $('#buttonURL').val("");
                editMultiple(node.id);
            });

            $(document).on("click", ".saveNode", function() {
                var nodes = $('#menuTree').jstree(true);
                var nodeID = $(this).attr('id');
                nodeID = nodeID.split("-");
                nodeID = nodeID[1];
                
                var buttonURL = $("#buttonURL-"+nodeID).val();
                var returnedObj = findAndReplaceLink(nodes, nodeID, buttonURL);
                findAndReplaceLink(nodes, selectedID, "links");

                $('#menuTree').jstree(true).settings.core.data = nodes;

                console.log(nodeID);
                console.log($("#buttonText-"+nodeID).val());
                console.log(buttonURL);

                nodes.set_text(nodeID, $("#buttonText-"+nodeID).val());
            });

            $(document).on("click", ".deleteNode", function() {
                console.log("deleteNode parent " + node.id);
                console.log("deleteNode children # " + node.children.length);

                if(node.children.length == 1){
                    $(".removeLinkList").click();
                }
                var nodes = $('#menuTree').jstree(true);
                var selectedID2 = $(this).attr('id');
                selectedID2 = selectedID2.split("-");
                selectedID2 = selectedID2[1];
                console.log("delete " + selectedID2);
                console.log(nodes);

                var result = nodes.delete_node(selectedID2);
                console.log(result);
                console.log($("#"+selectedID2));
                editMultiple(node.id);
            });

            $(document).on("click", ".addNode", function() {
                console.log("addNode " + node.children.length);
                fromAddNode = true;
                var nodes = $('#menuTree').jstree(true);
                selectedID = $(this).attr('id');
                selectedID = selectedID.split("-");
                selectedID = selectedID[1];

                $('#menuTree')
                .jstree({
                    "core": {
                        "check_callback" : true
                    }
                })
                .create_node(selectedID, {text: 'newNode'});

                console.log(selectedID);
                editMultiple(selectedID);
            });

            function nodeEditView(link){

                if(link){

                }else{
                    link = "(ex. http://www.bmo.com/some/page)";
                }

                var iconClasses = ["sprite1", "sprite2", "sprite3", "sprite4", "sprite5", "biz-loan","cheque","cheque-discount","cheque-rewards","concierge","creditcard-savings","gov-loan","home-loc","id-protection","merchant-loan","merchant-loc","overdraft-loc","schedule-cheque","fiftyfive","time-long","time-medium","time-short","wheelchair","personal-loc","ra-rrsploan","rrsp-readiline","agri-readiline-loc","commercial-loans-insurance","commercial-mortgage","compare-loan-option","compare-value","farm-equip-readiline","farm-mortgage","fixedrate-termloan","great-value","ilp","operating-loc","priceless-possibilities","sky-is-the-limit","sbusi-instalment-loan","sbusi-loc","us-loc-fromhb","variablerate-tloan","what-v-caniafford","interac-debit","agrinvest-account","business-current-account","business-premium","car-rental","car-trips","community-account","compare","cross-border-shopping","female-advisor","find-plan","giftcard","help-choose","merchandise","mobile-billpay","not-collecting","shopping-cart-am","small-business-plan","still-cannot-find","value-assist-plan","double-chevron-down","double-chevron-left","double-chevron-right","double-chevron-up","x-to-close","warning-tax","file-table","info-i","magnifying-glass-dollar","speech-bubble-graph","tools","warning-info","warning-money","googleplus","googleplus-filled","compare-credit-cards","credit-cards-funnel","trophy-calculator","share-filled","share","calculator-affordability","calculator-mortgage","credit-card-chip","first-time-homebuyer","airplane","alert","auto-checking","auto-envelope","baby","banking","book","building","building-executive","calculator","calendar-check","checkings","checkmark","chevron-down","chevron-left","chevron-right","chevron-up","circle-cycle","clock","credit-card","credit-card-motion","credit-card-reader","crown","cycle","dollar-bills","dollar-cycle","dollar-cycle-single","dollar-down","download","envelope","envelope-at","facebook","facebook-filled","fax","foreign-currency","game-controller","globe","globe-hand","graduation-hat","graph","group","group-tie","growth-trend","handshake","hockey-stick","house","individual","individual-hair","individual-joint","international","international-hand","internet-document","laptop","laptop-clock","laptop-money","laptop-trend","leaf","lending-money","light-bulb","linkedin","linkedin-filled","list-checkmark","lock","long-list","magnifying-glass","mail","minus","mobile-phone","money","monitor-dollar","multiple-cards","no-fees","number-1","number-2","number-3","number-4","number-5","number-6","number-7","number-8","number-9","number-10","number-11","number-12","number-13","number-14","number-15","number-16","number-17","number-18","number-19","number-20","old-building","one","painting","percent","percentage-growth","personal-wallet","phone","pie-graph","pin-drop","plan","plus","printer","profile","profile-tie","rss","rss-filled","safe-vault","scroll-caret","seniors","shield","shield-car","shield-check","shield-money","shirt-tie","shopping-card-lock","speech-bubble","stats","stethoscope","store-front","stroller","suitcase","suitcase-cycle","tablet-cast","tablet-dollar","tablet-play","tablet-stats","tablet-trend","thumbs-up","times-two","trend-magnifying-glass","trophy","twenty-five-percent","twitter","twitter-filled","two-directions","wallet","youtube","youtube-filled","youtube-play","zero-dollars"];
                    // var filling = "<div class='block floatleft'><button type='button' class='btn btn-default btn-circle btn-xl'><span class='icon individual large blue'></span></button><div class='BMO-label'>Sprite test</div></div>"
                    
                    var filling = '<div class="cancel"><button type="button" class="btn-default btn-xs" href="#"><div class="bmo-icon chevron-left"></div><h4>BACK</h4></button></div>';  
                        filling += '<ul class="nav nav-tabs">'+
                                      '<li role="presentation" class="active"><a id="iconsTab" href="#">Icons</a></li>'+
                                      '<li role="presentation"><a id="linksTab" href="#">Links</a></li>'+
                                    '</ul>';
                                  
                        filling += '<div id="editMultipleLinks"></div><br><br';
                        filling += '<div id="iconSelection"><h3>Select an icon</h3>'; 

                    for (var i = 0; i < iconClasses.length; i++) {
                        filling += "        <div class='block floatleft'><button type='button' class='btn btn-default btn-circle btn-xl'><div class='bmo-icon {0}'></div></button><div class='BMO-label'>{2} Sprite {1}</div></div>"
                            .replace("{0}", iconClasses[i])
                            .replace("{1}", iconClasses[i])
                            .replace("{2}", "#"+(i+1));
                    }
                    filling += '</div>'; 

                    document.getElementById("all-icons").innerHTML = filling;
                    $("#iconSelection").show();
                    $("#editMultipleLinks").hide();
            }

            $(document).on("click", "#linksTab", function() {
                $("#editMultipleLinks").show();
                $("#iconSelection").hide();
                $("#iconsTab").parent().removeClass("active");
                $(this).parent().addClass("active");
            });

            $(document).on("click", "#iconsTab", function() {
                $("#editMultipleLinks").hide();
                $("#iconSelection").show();
                $("#linksTab").parent().removeClass("active");
                $(this).parent().addClass("active");
            });



            function editMultiple(nodeID){
                console.log("editMultiple ");
                console.log(nodeID);
                //var nodes = $('#menuTree').jstree(true);
                var nodes = $('#menuTree').data().jstree.get_json();
                //var returnedNode = nodes.get_node(nodeID);

                node = getObjects(nodes, "id", nodeID);
                node = node[0];

                console.log(node.children);  

                var links = '<h3>Link List  <button id="addNode-{0}" type="button" class="addNode btn-default btn-lg"><div class="BMO-label">new link</div></button><button id="addNode-{0}" type="button" class="removeLinkList btn-default btn-lg"><div class="BMO-label">remove all links</div></button></h3><br><br>'
                .replace("{0}", nodeID);

                for (var i = 0; i < node.children.length; i++) {
                    links += '<input id="buttonText-{0}" class="nodeInputText" type="text" value="{4}"><input id="buttonURL-{1}" class="nodeInputURL" type="text" value="{5}"><button id="saveButton-{2}" type="button" class="saveNode btn-default btn-lg"><div class="BMO-label">delete</div></button><br>'
                    .replace("{0}", node.children[i].id)
                    .replace("{1}", node.children[i].id)
                    .replace("{2}", node.children[i].id)
                    .replace("{3}", node.children[i].id)
                    .replace("{4}", node.children[i].text)
                    .replace("{5}", node.children[i].a_attr.href);
                }

                // save button removed
                //<div class="BMO-label">save</div></button><button id="deleteButton-{3}" type="button" class="deleteNode btn-default btn-lg">

                $("#editMultipleLinks").html(links);

                $("#editMultipleLinks > input")
                  .focusout(function() {
                    console.log("focus out"+this.id);
                    $(".saveNode").click();
                  });
            }




            function isEquivalent(a, b) {
                // Create arrays of property names
                var aProps = Object.getOwnPropertyNames(a);
                var bProps = Object.getOwnPropertyNames(b);

                // If number of properties is different,
                // objects are not equivalent
                if (aProps.length != bProps.length) {
                    return false;
                }

                for (var i = 0; i < aProps.length; i++) {
                    var propName = aProps[i];

                    // If values of same property are not equal,
                    // objects are not equivalent
                    if (a[propName] !== b[propName]) {
                        return false;
                    }
                }

                // If we made it this far, objects
                // are considered equivalent
                return true;
            }


            function saveState(){
                var treejson = $('#menuTree').data().jstree.get_json();
                undoStates.push(treejson);
            }

            $(document).on("click", ".breadcrumb", function breadcrumbClick(){
        
                selectedID = this.id;
                columnIndex = this.dataset.col;

                var nodes = $('#menuTree').data().jstree.get_json();

                if(selectedID == "root"){
                    goHome();
                    return;
                }

                var returnedNode = getObjects(nodes, "id", selectedID);
                columns.push(returnedNode[0]);
                renderLayout(columns);

                var text = $('#menuTree').data().jstree.get_path(selectedID, "/");
                var path = $('#menuTree').data().jstree.get_path(selectedID, "/", true);
                console.log(path);

                renderBreadCrumb(path, text); 

                    // var nodes = $('#menuTree').jstree(true);

                    // if(columns.length-1 > columnIndex){
                    //     while(columns.length-1 > columnIndex){
                    //         columns.pop();
                    //     }
                    // }

                    // if(columnIndex == 0){
                    //     breadcrumbNav = "";
                    //     columns = [];
                    //     $("#breadcrumb").html(breadcrumbNav);
                    //     renderLayout();
                    //     columns.push(rootColumn);
                    // }else{
                    //     renderLayout(columns);
                    // }    
            });


            function renderBreadCrumb(path, text){
                breadcrumbNav = "";

                var text = text.split('/');
                var crumbs = path.split('/');
                
                for(var i = 0; i < crumbs.length -1; i++){

                    console.log(i + " " + text[i]);

                    if(i==0){  
                        breadcrumbNav += "<a id='"+crumbs[i]+"' data-col='"+i+"' class='breadcrumb' >Home</a>";
                    }else if(i==1){
                        //do nothing, since we want to skip L2 nodes
                    }
                    else{
                        breadcrumbNav += "<a id='"+crumbs[i]+"' data-col='"+i+"' class='breadcrumb' >"+ text[i] +"</a>";
                    }

                    if(i+2 < text.length && i != 1 && crumbs.length != 3){
                        breadcrumbNav += " > ";
                        console.log(">" + crumbs.length);
                    }

                }

                if(!iconBreadcrumb){
                    $("#breadcrumb").html(breadcrumbNav);
                }else{
                    $("#breadcrumb").html("");
                }
            }

            function renderLayout(nodeJSON){
                $("#container").removeClass("centerColumn");
                //layoutType = "column";
                if(layoutType === "row"){
                    $("#top").removeClass("column-border")
                }


                currentCol = 0;

                //transform pattern for json2html
                var transforms = {
                    "parent":[
                        {"<>":"div", "class": layoutType +" floatleft ${css}", "id":"${id}", "data-col":function(){return(currentCol)},  "children":[
                        {"<>":"div", "html":"<h3>${text}</h3>"},
                        {"<>":"div","html":function(){return(json2html.transform(this.children, transforms.child));},
                        }]},
                        
                    ],

                    "child":[{"<>":"div", "class":"block floatleft", "children":[ {"<>":"button", "type":"button", "class":"btn btn-default btn-circle btn-xl", "id":"${id}","href":"${a_attr.href}","children":[  
                            {"<>": "div", "class":"bmo-icon ${icon}", "html":""}]},{"<>":"div", "class":"BMO-label", "html":"${text}"}
                        ]}]
                };

                //$("#container").empty();
                //menu.deactivate();
                //site map json structure
                var html = "";
                var treejson = $('#menuTree').data().jstree.get_json();
                
                // if(undo){
                //     undo = false;
                // }else{
                //     if(undoStates.length > 0){
                //     if(isEquivalent(undoStates[undoStates.length-1], treejson)){
                //         
                //         undoStates.push(treejson);
                //     }
                //     }
                // }
                
                if(treejson.length > 0){
                    
                    treejson = treejson[0].children;
                   // debugger;
                    html = json2html.transform(treejson,transforms.parent);
                    $("#top").html(html);
                   
                    // $(".column").each(function(){
                    //     $(this).addClass("column-borders");
                    // });

                    var numberOfChildren = $("#top > .column").length;
                    if(numberOfChildren > 2){
                        
                        $("#top").addClass("flex-align-start");
                    }else{
                         $("#top").removeClass("flex-align-start");
                    }
                }

                
                
                if(nodeJSON){
                     
                     ////console.table(nodeJSON);
                    $("#container").addClass("centerColumn");
                    layoutType = "row";
                    var colsHTML = "";
                    breadcrumbNav = "";
                    //var treejson = nodeJSON;
                    //if(cols != null || cols != undefined){
                        for(var i=0;i<=nodeJSON.length;i++){

                            
                          if(iconBreadcrumb || i == nodeJSON.length - 1){
                               colsHTML += json2html.transform(nodeJSON[i],transforms.parent);
                                
                               //colsHTML += cols[i];
                               
                               // currentCol++;
                                // var parentColumn = "<div class='row' floatleft' data-col='"+currentCol+"'>" + $(this).parent().parent().parent().html() +"</div>";
                                // if(i != nodeJSON.length-1){
                                //     if(layoutType == "column"){
                                //         colsHTML+= "<div class="+"'division floatleft'"+">" +
                                //             "<div class='btn btn-default btn-circle btn-lg floatleft' style='margin: 220px -35px;' href='#'><div class='bmo-icon sprite68'></div></div></div>";
                                //     }else{
                                //         colsHTML+= "<div class="+"'divisionH floatleft'"+">" +
                                //             "<button type='button' class='btn btn-default btn-circle btn-lg division-btn'' href='#'><div class='bmo-icon sprite66'></div></button></div>";
                                //     }
                                // }
                                
                           }

                           currentCol++;
                            
                       }  //end for
  
                       //html = colsHTML + html;
                    //}
                    // if(treejson.length > 0){
                    //     treejson = treejson[0].children;
                    // }
                    //console.log("render passed json " + colsHTML)
                    colsHTML = colsHTML.replaceAll("column","row"); 
                    html = colsHTML;

                    //debugger;
                    $("#top").html(html);
                }

                //button badges
                //html = html.replaceAll('button__badge">0','">');
                //html = html.replaceAll('"undefined"',"");  


                //render highlights for breadcrumb
                // if(iconBreadcrumb){
                //     for(var i=0;i<breadCrumb.length; i++){
                //         $("#container").find("#"+breadCrumb[i]).addClass("btn-highlight");
                //         
                //     }
                // }
            }

            function loadJSON(){

                console.log('http://ebusiness.bmogc.net/apps/flow/landingpages/'+mapName+'.js');

                $.getScript( 'http://ebusiness.bmogc.net/apps/flow/landingpages/'+mapName+'.js', function( data, textStatus, jqxhr ) {
                  console.log( data ); // Data returned
                  console.log( textStatus ); // Success
                  console.log( jqxhr.status ); // 200
                  console.log( "Load was performed." );

                  $('#menuTree').jstree(true).settings.core.data = JSON.parse(data);
                  $('#menuTree').jstree(true).refresh();
                  setTimeout(renderLayout, 1000);
                });
            }


            $.fn.log = function() {
              //console.log.apply(//console, this);
              return this;
            };

            $(".saveImage").click(function() {
                saveImage();


              //$('#menuTree').jstree('select_node', 'node3');
              
              ////console.log("get node "+$('#menuTree').get_node('#node3'));


              //$('#menuTree').jstree(true).set_icon(nodes, "sprite20");

               //$('#menuTree').jstree(true).delete_node('node3');
              //$('#menuTree').jstree('set_icon','#node2','sprite20');

                //var treejson = JSON.stringify($('#menuTree').data().jstree.get_json());

                // var leaves = traverse(treejson).reduce(function (acc, x) {
                //     if (this.isLeaf) acc.push(x);
                //     return acc;
                // }, []);

                // traverse(treejson, function (key, value, trail) {
                //   //console.log(arguments)
                // });

                
                

            });

            //return an array of objects according to key, value, or key and value matching
            function getObjects(obj, key, val) {
                var objects = [];
                for (var i in obj) {
                    if (!obj.hasOwnProperty(i)) continue;
                    if (typeof obj[i] == 'object') {
                        objects = objects.concat(getObjects(obj[i], key, val));    
                    } else 
                    //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
                    if (i == key && obj[i] == val || i == key && val == '') { //
                        objects.push(obj);
                    } else if (obj[i] == val && key == ''){
                        //only add if the object is not already in the array
                        if (objects.lastIndexOf(obj) == -1){
                            objects.push(obj);
                        }
                    }
                }
                return objects;
            }

            function findAndReplaceLink(object, value, replacevalue) {
              foundKey = false;
              for (var x in object) {
                if (object.hasOwnProperty(x)) {
                  if (typeof object[x] == 'object') {
                    findAndReplaceLink(object[x], value, replacevalue);
                    if(foundKey){
                        return;
                    }
                  }
                  if (object['id'] == value) {
                    foundKey = true;
                    
                    //object["text"] = replacevalue;
                    object["a_attr"] = {"href":replacevalue};
                    console.log("found link " + replacevalue);
                    return object; // uncomment to stop after first replacement
                  }
                }
              }
            }

            function findAndReplaceIcon(object, value, replacevalue) {
              
              foundKey = false;
              for (var x in object) {
                if (object.hasOwnProperty(x)) {
                  if (typeof object[x] == 'object') {
                    findAndReplaceIcon(object[x], value, replacevalue);
                    if(foundKey){
                        return object[0];
                    }
                  }
                  if (object['id'] == value) {
                    foundKey = true;
                    
                    
                    object.icon = replacevalue;
                    
                    
                    
                    return object; // uncomment to stop after first replacement
                  }
                }
              }
            }

            //Context menu, right click to edit
            $(document).on("contextmenu", "button", function(e) {
              //alert( "Doc Handler for .contextmenu() called." + $(this).attr('id'));
              //editButtons = true;
              var nodes = $('#menuTree').jstree(true);

              if(iconSelect == false){
                    $('#top').css("display", "none");
                    $('#all-icons').css("display", "block");
                    selectedIcon = $(this).children('div');
                    selectedClass = $(this).children('div').attr('class');
                    selectedID = $(this).attr('id');
                    columnIndex = $(this).closest("."+layoutType).attr("data-col");
                    
                    iconSelect = true;

                    node = nodes.get_node(selectedID);
                    //proper way to get a node
                    selectedLink = nodes.get_node(selectedID).a_attr.href;

                    if(selectedLink != '#' || selectedLink != undefined){
                        $('#buttonURL').val(selectedLink);
                    }else{
                        $('#buttonURL').val('http://www.bmo.com/#enter-some-url');
                    }
              }

              nodeEditView(selectedLink);
              editMultiple(selectedID);

              // if(selectedLink == "links"){
              //    $("#singleLink").hide(); 
              //    $("#editMultipleLinks").show();
              // }else{
              //    $("#singleLink").show();
              //    $("#editMultipleLinks").hide();
              // }
            });


            // $( ".btn" ).contextmenu(function() {
            //   alert( "Handler for .contextmenu() called.");
            // });
            
            $(document).on("click", ".btn", function() {
            // $(".btn").click(function() {
                
                var nodes = $('#menuTree').jstree(true);

                if(iconSelect == false && editButtons == false){ 
                    

                    //render next layout on button click
                    nodes = $('#menuTree').data().jstree.get_json();
                    selectedID = $(this).attr('id');
                    parentID = $(this).closest("."+layoutType).attr("id");
                    buttonLink = $(this).attr('href');
                    columnIndex = $(this).closest("."+layoutType).attr("data-col"); //.dataset.index;//.dataset.index;
                    //columnIndex = columnIndex.dataset;
                    //$("#"+selectedID+"_anchor").click();

                    //var openNode = $('#menuTree').jstree(true).get_node(selectedID);
                    firstLoad = true;
                    $('#menuTree').jstree(true).deselect_all();
                    $('#menuTree').jstree(true).select_node(selectedID);

                    //search json for node matching selected ID

                    node = getObjects(nodes, "id", selectedID);
                    if(node.length == 0){
                        return;
                    }
                    console.log(node);

                    console.log(buttonLink);
                    if(buttonLink && buttonLink !== "#" && buttonLink !== "Text"){
                        var win = window.open(buttonLink, '_blank');
                        buttonState = buttonLink;
                    }

                    if(node[0].a_attr.href){
                        buttonState = node[0].a_attr.href;
                    }else{
                        buttonState = "";
                    }

                    console.log(node);

                    //node URL
                    //var nodeURL = node[0].a_attr;
                      
                    if(node[0] == undefined){return};

                    //dialog content for list of links pop-up
                    var $dialogContent = $('<div></div>');
                    for(var i = 0; i<node[0].children.length; i++){
                        $dialogContent.append("<a href=" + node[0].children[i].a_attr.href + " target='_blank'>"+node[0].children[i].text+"</a><br/>");
                    }

                    //single link
                    if(linkToggle &&  node[0].children.length == 1 && buttonState == "links"){
                        if(node[0].children[0].a_attr.href.indexOf('http') == -1 || node[0].children[0].a_attr.href == " " || node[0].children[0].a_attr.href == "#"){
                            alert("Invalid button link. Please edit the button's link by right clicking this button.");
                            return;
                        }else{
                            var win = window.open(node[0].children[0].a_attr.href, '_blank');
                            return;
                        }

                        if (win) {
                            //Browser has allowed it to be opened
                            win.focus();
                        } else {
                            //Browser has blocked it
                            alert('Please allow popups for this website');
                        }
                    }else if(linkToggle && buttonState == "links" && node[0].children.length > 1){
                        BootstrapDialog.show({
                                    title: 'Links',
                                    message: $dialogContent,
                                    buttons: [{
                                        label: 'Close',
                                        action: function(dialogRef){
                                            dialogRef.close();
                                        }
                                    }]
                        });
                        return;
                    }


                    
                     
                    
                    // var setClass = $(this).children('div').attr('class');
                    // nodes = $('#menuTree').jstree(true);
                    // nodes.set_icon(selectedID,setClass+" btn-highlight");


                    ////console.log("click button " + $(this).parent().parent().parent().html());
                    //console.table(node[0]);
                    if(node[0].children.length>0){

                        //if a node has more than zero children then add it as the root column of breadcrumb after click
                        if(rootColumn.length == 0){
                            rootColumn = getObjects(nodes, "id", parentID);
                            rootColumn.pop();
                            columns.push(rootColumn);
                        }

                        $("#"+selectedID).addClass("btn-highlight");
                        breadCrumb[columnIndex] = selectedID;
                        //breadCrumb.push(selectedID);

                        //get breadcrumb path
                        var data = $('#menuTree').data().jstree.get_selected(true)[0];
                        var text = $('#menuTree').data().jstree.get_path(selectedID, "/");
                        var path = $('#menuTree').data().jstree.get_path(selectedID, "/", true);

                        renderBreadCrumb(path, text); 


                        if(node.length > 1){
                            node.pop();
                        }

                        // if(node == columns[columns.length-1]){

                        // }else{
                        //console.log("~~~~~~~~~~~~~~~ columns length "+columns.length+" index "+columnIndex)
                        if(columns.length-1 > columnIndex){
                            while(columns.length-1 > columnIndex){
                                columns.pop();
                            }
                            
                            columns.push(node);
                        }else{
                            //columns.push(rootColumn);    
                            columns.push(node);
                        }
                        //}

                        renderLayout(columns);
                        //renderLayout(node);
                    }
             }else{  
                    
                //selectedID = $(this).attr('id');
                //renderLayout(nodes.get_node(selectedID));

                if(iconSelect == false && editButtons == true){
                                        
                    $('#top').css("display", "none");
                    $('#all-icons').css("display", "block");
                    selectedIcon = $(this).children('div');
                    selectedClass = $(this).children('div').attr('class');
                    selectedLink = $(this).attr('href');
                    selectedID = $(this).attr('id');
                    columnIndex = $(this).closest("."+layoutType).attr("data-col");
                    
                    iconSelect = true;

                    if(selectedLink != '#' || undefined){
                        $('#buttonURL').val(selectedLink);
                    }else{
                         $('#buttonURL').val('http://www.bmo.com/#enter-some-url');
                    }
                }else{
                    saveState();
                    
                    var setClass = $(this).children('div').attr('class');
                    //$(selectedIcon).removeClass(selectedClass);
                    //$(selectedIcon).addClass(setClass);
                    
                    $('#top').css("display", "block");
                    $('#all-icons').css("display", "none");
                    //nodes.select_node(selectedID);
                    nodes.set_icon(selectedID,setClass);
                    //columns.set_icon(selectedID,setClass);
                    var iconObj = findAndReplaceIcon(columns[columnIndex], selectedID, setClass);
                    
                    var getInputURL = $('#buttonURL').val();
                    
                    if(getInputURL !== "https://www.bmo.com/main/personal#enter-some-url"){
                        console.log(nodes);
                        var returnedObj = findAndReplaceLink(nodes, selectedID, getInputURL);
                    }
                    
                    foundKey = false;
                    $('#menuTree').jstree(true).settings.core.data = nodes;
                    //$('#menuTree').jstree(true).refresh();
                    iconSelect = false;
                    //nodes = $('#menuTree').data().jstree.get_json();
                    //node = getObjects(nodes, "id", selectedID);
                    if(columns.length > 0){
                        //columns.push(node);
                        renderLayout(columns);
                    }else{
                        renderLayout();
                    }

                    // var selectedButton = $("#"+selectedID).find('div');
                    // $(selectedButton).removeClass(selectedClass);
                    // $(selectedButton).addClass(setClass);
                }
             }
            });

                  // $('#menuTree')
                  // // listen for event
                  // .on('changed.jstree', function (e, data) {
                  //    //saveState();

                  //    console.log("save state");
                  // });

                  $('#menuTree')
                  // listen for event
                  .on('select_node.jstree', function (e, data) {
                    if(!firstLoad){
                         //(columns.length > 1) ? renderLayout(columns) : renderLayout();
                         breadCrumb = [];
                         columns = [];

                         if(data.instance.get_node(data.selected[0]).id == "root"){
                            goHome();
                            return;
                         }

                         var nodes = $('#menuTree').data().jstree.get_json();
                         var clickedNodeID = data.instance.get_node(data.selected[0]).id;
                         var returnedNode = getObjects(nodes, "id", clickedNodeID);
                         columns.push(returnedNode[0]);
                         renderLayout(columns);

                         console.log("clickedNodeID" + clickedNodeID);
                         //get breadcrumb path
                         if(clickedNodeID){
                             var text = $('#menuTree').data().jstree.get_path(clickedNodeID, "/");
                             var path = $('#menuTree').data().jstree.get_path(clickedNodeID, "/", true);

                             renderBreadCrumb(path, text); 
                        }
                    }else{
                        firstLoad = false;
                    }
                  });

                  $('#menuTree')
                  // listen for event
                  .on('create_node.jstree', function (e, data) {
                     //(columns.length > 1) ? renderLayout(columns) : renderLayout();
 
                    if(!fromAddNode){
                        breadCrumb = [];
                        columns = [];
                        saveState();

                        if(data.node.parent == "root"){
                            goHome();
                            return;
                         }

                        var nodes = $('#menuTree').data().jstree.get_json();
                        var clickedNodeID = data.node.parent;
                        var returnedNode = getObjects(nodes, "id", clickedNodeID);
                        columns.push(returnedNode);
                        renderLayout(columns);
                    }else{
                        fromAddNode = false;
                    }
                  });

                 $('#menuTree')
                  // listen for event
                  .on('delete_node.jstree', function (e, data) {
                     //(columns.length > 1) ? renderLayout(columns) : renderLayout();
                     breadCrumb = [];
                     saveState();
                     renderLayout();
                  });

                  $('#menuTree')
                  // listen for event
                  .on('rename_node.jstree', function (e, data) {
                     //(columns.length > 1) ? renderLayout(columns) : renderLayout();
                     breadCrumb = [];
                     saveState();
                     renderLayout();
                  });

                  $('#menuTree')
                  // listen for event
                  .on('move_node.jstree', function (e, data) {
                     //(columns.length > 1) ? renderLayout(columns) : renderLayout();
                     breadCrumb = [];
                     saveState();
                     renderLayout();
                  });

            // setTimeout(function() {
            //      $('.render').trigger("click");

            //      $('#menuTree')
            //       // listen for event
            //       .on('changed.jstree', function (e, data) {
            //          renderLayout();
            //       })
            //       // create the instance
            //       .jstree();
            // },1000);

         openFile = function (event) {
            var input = event.target;
            var reader = new FileReader();
            reader.onload = function () {
                var map = reader.result;
                //var node = document.getElementById('output');
                //node.innerText = map;

                $('#menuTree').jstree(true).settings.core.data = JSON.parse(map);
                $('#menuTree').jstree(true).refresh();
                setTimeout(renderLayout, 1000); 
            };
            reader.readAsText(input.files[0]);
         };

        $('#submit-file').on("click",function(e){
            e.preventDefault();
            $('#files').parse({
                config: {
                    delimiter: "auto",
                    complete: csvToJSON,
                },
                before: function(file, inputElem)
                {
                    //console.log("Parsing file...", file);
                },
                error: function(err, file)
                {
                    //console.log("ERROR:", err, file);
                },
                complete: function()
                {
                    //console.log("Done with all files");
                }
            });
        });

        $('#newJSON').on("click",function(e){
            console.log("newJSON");
            e.preventDefault();

            $('#menuTree').jstree(true).destroy(true);
            //$('#menuTree').jstree();

            var newTree = [];
            newTree.push({ "id":"root","text" : "Root", "icon":"column", "children":[]});
            newTree[0].children.push({ "id":"node1","text" : "col1", "icon":"column", "children":[]});
            newTree[0].children[0].children.push({ "id":"node2","text" : "node", "icon":"hockey-stick", "children":[]});

            console.log(newTree);

            $('#menuTree').jstree({ 'core' : {
                'data' : newTree
            } });

            // $('#menuTree').jstree(true).settings.core.data = { "id":"root","text" : "Root", "icon":"column"}; //newJSON;
            $('#menuTree').jstree(true).refresh();


            renderLayout();

            console.log($('#menuTree').data().jstree.get_json());
        });

        $('#addNode').on("click",function(e){
            console.log("addNode");
            e.preventDefault();

            var newNode = {"id":Math.random()*10000000, "text":"new node", "icon":"globe", a_attr:{}};
            newNode.a_attr.href = "http://www.cbc.ca";

            $('#menuTree')
            .jstree()
            .create_node("#", newNode);

            console.log($('#menuTree').data().jstree.get_json());

            renderLayout();
        });


        function Node(id, text, icon, url) {
            this.id = id;
            this.text = text;
            this.icon = icon;
            if(url){
                this.a_attr = {"href":url, "id":id+"_anchor"};
            }else{
                this.a_attr = {"href":"#", "id":id+"_anchor"};
            }
            this.children = []; // array
        
        }

        Node.prototype.getChild = function (id) {
            var node;
            this.children.some(function (n) {
                if (n.id === id) {
                    node = n;
                    return true;
                }
            });
            return node;
        };

        function createJSTree(data) {
            var normalized = new Node('root', 'root', 'icon');

            data.forEach(function(value){
              var temp = value.path.split(' / ');
              
              if(temp[temp.length-1] == undefined || temp[temp.length-1] == "undefined" || temp[temp.length-1] == ""){
                temp.pop();
              }

              temp.reduce(function(r, b) {
                var node = r.getChild(b);
                    if (!node) {
                        node = new Node(b, b, 'value-assist-plan', value.url);
                        console.log(value.url);
                        r.children.push(node);
                    }
                    return node;
                
              }, normalized);
            });

            //console.log('normalized', JSON.stringify(normalized));
            iterate(normalized);

            return normalized;
        }

        function iterate(obj) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (typeof obj[property] == "object")
                        iterate(obj[property]);
                    else if (property == "id"){
                        obj[property] = Math.floor(Math.random()*10000000000000)+"-"+Math.floor(Math.random()*10000000000000);
                    }
                }
            }
        }

        function csvToJSON(results){
            //var table = "<table class='table'>";
            var data = results.data;

            var newArray = [];
             
            for(i=0;i<data.length;i++){
                //table+= "<tr>";
                var row = data[i];
                var cells = row.join(",").split(",");

                if(cells[4] !== "" && cells[4] !== undefined){
                    console.log("cell 4", cells[4]);
                }

                if(cells[5] == "" || cells[5] == undefined || cells[5] == "undefined" ){
                    cells[5] = "#";
                }
                
                if(cells[4] !== "" && cells[4] !== undefined){
                    newArray.push({path:cells[0] + " / " + cells[1] + " / " + cells[4], url: cells[5]});   
                }else{
                    newArray.push({path:cells[0] + " / " + cells[1], url:cells[5]});
                } 

                if(typeof cells[4] == "string"){
                    console.log(cells[4]);
                }
                // for(j=0;j<cells.length;j++){
                //     table+= "<td>";
                //     table+= cells[j];
                //     if(j === 1){
                //         console.log(cells[j]);
                //     }
                //     table+= "</th>";
                // }
                // table+= "</tr>";
            }
            //table+= "</table>";
            //$("#parsed_csv_list").html(table);
            var newTree = createJSTree(newArray);

            $('#menuTree').jstree(true).settings.core.data = newTree;
            $('#menuTree').jstree(true).refresh(); 

            renderLayout();
        }

         function initTree(jsonData) {
            if(jsonData){
                JSONtree = jsonData;
            }

            //console.log("actually loaded json " + JSONtree)

          $('#menuTree').jstree({
            'core' : {
               "check_callback" : true,
              'data' : JSONtree
            },
            "types" : {
            "#" : {
              "max_children" : 100,
              "max_depth" : 10,
              "valid_children" : ["root"]
            },
            "root" : {
              "icon" : "/static/3.3.1/assets/images/tree_icon.png",
              "valid_children" : ["default"]
            },
            "default" : {
              "valid_children" : ["default","file"]
            },
            "file" : {
              "icon" : "glyphicon glyphicon-file",
              "valid_children" : []
            }
          },
          "plugins" : [
            "contextmenu", "dnd", "search",
            "state", "types", "wholerow"
          ]
          });
        };

        initTree();
        nodeEditView();

    });