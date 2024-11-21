const populateAccordion = (data) => {
    let html = '';
    data.forEach((section, index) => {
        const mainHeading = section.main_heading;
        const isFirst = index === 0 ? "show" : "";
        const collapsedClass = index === 0 ? "" : "collapsed";
        const expandedState = index === 0 ? "true" : "false";
        const accordionId = `collapse${index + 1}`;

        html += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${collapsedClass}" type="button" data-bs-toggle="collapse" data-bs-target="#${accordionId}" aria-expanded="${expandedState}" aria-controls="${accordionId}">
                        ${mainHeading}
                    </button>
                </h2>
                <div id="${accordionId}" class="accordion-collapse collapse ${isFirst}" data-bs-parent="#guideaccordion">
                    <div class="accordion-body">
                        <div class="gui-acc-tab-div">`;

        // Generate tabs
        section.items.forEach((item, idx) => {
            const tabClass = `${item.sub_heading.toLowerCase().replace(/&/g, '').replace(/\s+/g, '')}${index + 1}`;
            const isActive = idx === 0 ? "active" : ""; // Define isActive here

            html += `
                <p class="gui-acc-tab ${isActive}" data-gtabcnt="${tabClass}" style="color:#333333;">${item.sub_heading}</p>`;
        });

        html += `</div>`;

        // Generate tab content split by <br> tags
        section.items.forEach((item, idx) => {
            const tabClass = `${item.sub_heading.toLowerCase().replace(/&/g, '').replace(/\s+/g, '')}${index + 1}`;
            const contents = item.sub_content.split('<br>').map(content => content.trim()).filter(content => content !== ''); // Split by <br> and filter empty strings
            
            // Only one div per tab for contents
            const isActive = idx === 0 ? "active" : ""; // Define isActive here as well
            html += `
            <div class="gui-acc-tab-cnt ${tabClass} ${isActive}">`; // Add the tabClass and active class here

            contents.forEach((content) => {
                html += `
                    <p class="gui-acc-cnt">${content}</p>`; // Each content directly uses gui-acc-cnt
            });

            html += `</div>`; // Close the gui-acc-tab-cnt div
        });

        html += `
                    </div>
                </div>
            </div>`;
    });

    $('#guideaccordion').html(html);

    // Tab switching functionality
    $('.gui-acc-tab').on('click', function () {
        const parentTabs = $(this).closest('.gui-acc-tab-div').find('.gui-acc-tab');
        const parentContents = $(this).closest('.accordion-body').find('.gui-acc-tab-cnt');
        const targetClass = $(this).data('gtabcnt');

        parentTabs.removeClass('active');
        $(this).addClass('active');

        parentContents.hide();
        // Show all contents for the selected tab
        parentContents.each(function() {
            if ($(this).hasClass(targetClass)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
};




function loadAccordionData() {
    fetch('json/pramaan_how_to_guide.json')
        .then(response => response.json())
        .then(data => {
            populateAccordion(data);
        })
        .catch(error => console.error('Failed to load accordion data:', error));
}

// Call the fetch function to load and render accordion content on page load
loadAccordionData();

