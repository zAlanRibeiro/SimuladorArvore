document.addEventListener('DOMContentLoaded', function() {
    
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);

            tabs.forEach(t => t.classList.remove('active'));
            
            contents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            
            targetContent.classList.add('active');
        });
    });
});