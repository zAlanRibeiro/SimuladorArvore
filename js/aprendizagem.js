document.addEventListener('DOMContentLoaded', function() {
    
    // Seleciona todos os botões de aba
    const tabs = document.querySelectorAll('.tab-link');
    
    // Seleciona todos os painéis de conteúdo
    const contents = document.querySelectorAll('.tab-content');

    // Adiciona um "ouvinte" de clique para cada botão de aba
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Pega o valor do atributo 'data-tab' do botão que foi clicado
            const targetId = tab.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);

            // 1. Remove a classe 'active' de TODAS as abas
            tabs.forEach(t => t.classList.remove('active'));
            
            // 2. Remove a classe 'active' de TODOS os conteúdos para escondê-los
            contents.forEach(c => c.classList.remove('active'));

            // 3. Adiciona a classe 'active' APENAS na aba que foi clicada
            tab.classList.add('active');
            
            // 4. Adiciona a classe 'active' APENAS no conteúdo correspondente para mostrá-lo
            targetContent.classList.add('active');
        });
    });
});