document.addEventListener("DOMContentLoaded", function() {
    const sidebarHTML = `
        <div class="sidebar-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sidebar-logo">
                <path d="M12 11v8M12 3v4M18.364 5.636a9 9 0 1 1-12.728 0 9 9 0 0 1 12.728 0z"></path>
            </svg>
            <h1>DataStructs</h1>
        </div>
        <nav>
            <ul>
                <li><a href="index.html" class="sidebar-link" data-page="index.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>
                    <span>Dashboard</span>
                </a></li>
                <li><a href="arvoreAvl.html" class="sidebar-link" data-page="arvoreAvl.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10v12"></path><path d="M12 3.5A2.5 2.5 0 0 1 14.5 6V8a2.5 2.5 0 0 1-5 0V6A2.5 2.5 0 0 1 12 3.5z"></path><path d="m4 14 1.1-1.1c.9-.9 2.1-1.4 3.4-1.4h7c1.3 0 2.5.5 3.4 1.4L20 14"></path></svg>
                    <span>Árvore AVL</span>
                </a></li>
                <li><a href="estruturas.html" class="sidebar-link" data-page="estruturas.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20M2 6h20M2 18h20" /></svg>
                    <span>Fila & Pilha</span>
                </a></li>
                <li><a href="lista.html" class="sidebar-link" data-page="lista.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h2"></path><path d="M6 12h2"></path><path d="M10 12h2"></path><path d="M14 12h2"></path><path d="M18 12h2"></path><path d="M20 12h2"></path></svg>
                    <span>Lista Ligada</span>
                </a></li>
                <li><a href="aprendizagem.html" class="sidebar-link" data-page="aprendizagem.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    <span>Aprendizagem</span>
                </a></li>
                <li><a href="avaliacao.html" class="sidebar-link" data-page="avaliacao.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span>Nos Avalie</span>
                </a></li>
            </ul>
        </nav>
    `;

    const container = document.getElementById("sidebar-inject");
    if (container) {
        container.innerHTML = sidebarHTML;

        // Lógica de Link Ativo
        const path = window.location.pathname.split("/").pop() || "index.html";
        const activeLink = document.querySelector(`.sidebar-link[data-page="${path}"]`);
        if (activeLink) activeLink.classList.add("active");
    }
});