/* =========================================================================
   Victor Guilarte — Portfolio
   Vanilla JS · ES2020+
   ========================================================================= */
(function () {
	'use strict';

	/* ------------------------------------------------------------------------
	   0. Utilities
	   ------------------------------------------------------------------------ */
	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';

	/* ------------------------------------------------------------------------
	   1. Language switching
	   ------------------------------------------------------------------------ */
	const LANG_DEFAULT = 'en';
	const LANG_STORAGE = 'vg.lang';

	/* Shared state: the dictionary of the active language plus the active id. */
	const state = { lang: LANG_DEFAULT, texts: null };

	async function loadTexts(lang) {
		if (state.texts && state.texts.__lang === lang) return state.texts;
		/* Normal caching: the browser revalidates with ETag instead of
		   re-downloading the file on every visit. */
		const res = await fetch(`languages/${lang}.json`);
		if (!res.ok) throw new Error(`HTTP ${res.status} loading ${lang}.json`);
		const data = await res.json();
		state.texts = Object.assign({}, data, { __lang: lang });
		return state.texts;
	}

	/* Look up a translatable string, with a built-in English fallback. */
	function t(key, fallback) {
		const value = state.texts ? state.texts[key] : undefined;
		return typeof value === 'string' && value.length ? value : (fallback || '');
	}

	function applyTexts(texts) {
		$$('[data-text]').forEach((el) => {
			const value = texts[el.dataset.text];
			if (typeof value === 'string' && value.length) el.textContent = value;
		});
	}

	/* Attributes that carry a translatable string (aria-label, ...). */
	function applyAriaLabels(texts) {
		$$('[data-aria-label]').forEach((el) => {
			const value = texts[el.dataset.ariaLabel];
			if (typeof value === 'string' && value.length) el.setAttribute('aria-label', value);
		});
	}

	async function setLanguage(lang) {
		try {
			const texts = await loadTexts(lang);
			state.lang = lang;
			applyTexts(texts);
			applyAriaLabels(texts);
			document.documentElement.lang = lang;
			$$('.flags-item').forEach((item) => {
				const isActive = item.dataset.lang === lang;
				item.classList.toggle('active', isActive);
				item.setAttribute('aria-pressed', String(isActive));
			});
			updateThemeLabel();
			try {
				localStorage.setItem(LANG_STORAGE, lang);
			} catch (err) { /* private mode */ }
		} catch (err) {
			console.error('Language load failed:', err);
		}
	}

	function initLanguage() {
		let saved = LANG_DEFAULT;
		try {
			saved = localStorage.getItem(LANG_STORAGE) || LANG_DEFAULT;
		} catch (err) { /* private mode */ }
		setLanguage(saved);

		$('#flags')?.addEventListener('click', (e) => {
			const item = e.target.closest('.flags-item');
			if (!item) return;
			setLanguage(item.dataset.lang);
		});
	}

	/* ------------------------------------------------------------------------
	   2. Theme toggle
	   ------------------------------------------------------------------------ */
	const THEME_STORAGE = 'vg.theme';
	const THEME_DEFAULT = 'dark';

	function setTheme(theme) {
		document.documentElement.setAttribute('data-theme', theme);
		const meta = $('#theme-color');
		if (meta) meta.setAttribute('content', theme === 'light' ? '#fafafa' : '#0a0a0f');
		updateThemeLabel();
		try {
			localStorage.setItem(THEME_STORAGE, theme);
		} catch (err) { /* private mode */ }
	}

	/* The button advertises the state it switches TO, and exposes the current
	   state through aria-pressed. */
	function updateThemeLabel() {
		const theme = document.documentElement.getAttribute('data-theme') || THEME_DEFAULT;
		const btn = $('#theme-toggle');
		const icon = $('#theme-toggle-icon');
		if (icon) icon.setAttribute('href', theme === 'light' ? '#i-bx-moon' : '#i-bx-sun');
		if (!btn) return;
		const isLight = theme === 'light';
		btn.setAttribute('aria-pressed', String(isLight));
		const label = isLight
			? t('theme_toggle_dark', 'Switch to dark theme')
			: t('theme_toggle_light', 'Switch to light theme');
		btn.setAttribute('aria-label', label);
	}

	function initTheme() {
		/* The inline head script already resolved the theme before first paint. */
		updateThemeLabel();
		$('#theme-toggle')?.addEventListener('click', () => {
			const current = document.documentElement.getAttribute('data-theme') || THEME_DEFAULT;
			setTheme(current === 'dark' ? 'light' : 'dark');
		});
	}

	/* ------------------------------------------------------------------------
	   3. Header scroll state & active section indicator
	   ------------------------------------------------------------------------ */
	function initHeader() {
		const header = $('#site-header');
		const navLinks = $$('.navbar a[href^="#"]');
		const sections = navLinks
			.map((link) => document.getElementById(link.getAttribute('href').slice(1)))
			.filter(Boolean);

		const setActive = (id) => {
			navLinks.forEach((link) => {
				const isActive = link.getAttribute('href').slice(1) === id;
				link.classList.toggle('is-active', isActive);
				if (isActive) link.setAttribute('aria-current', 'location');
				else link.removeAttribute('aria-current');
			});
		};
		setActive('home');

		const onScroll = () => {
			header?.classList.toggle('is-scrolled', window.scrollY > 8);
			$('.scroll-top')?.classList.toggle('is-visible', window.scrollY > 600);
		};

		/* One rAF-throttled listener for the whole page. */
		let ticking = false;
		document.addEventListener('scroll', () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				onScroll();
				ticking = false;
			});
		}, { passive: true });
		onScroll();

		if ('IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) setActive(entry.target.id);
					});
				},
				{ rootMargin: '-40% 0px -55% 0px', threshold: 0 }
			);
			sections.forEach((s) => observer.observe(s));
		}
	}

	/* ------------------------------------------------------------------------
	   4. Mobile menu (off-canvas)
	   ------------------------------------------------------------------------ */
	function initMobileMenu() {
		const toggle = $('#menu-icon');
		const nav = $('.primary-nav');
		if (!toggle || !nav) return;

		const mq = window.matchMedia('(max-width: 960px)');

		const setIcon = (open) => {
			const icon = $('#menu-toggle-icon');
			if (icon) icon.setAttribute('href', open ? '#i-bx-x' : '#i-bx-menu');
		};

		/* While the panel is closed on small screens it must be out of the tab
		   order: `visibility: hidden` (CSS) plus `inert` (script). */
		const sync = () => {
			const open = document.body.classList.contains('menu-open');
			if (mq.matches) {
				nav.toggleAttribute('inert', !open);
				if (open) nav.removeAttribute('aria-hidden');
				else nav.setAttribute('aria-hidden', 'true');
			} else {
				nav.removeAttribute('inert');
				nav.removeAttribute('aria-hidden');
			}
		};

		const close = (restoreFocus) => {
			document.body.classList.remove('menu-open');
			toggle.setAttribute('aria-expanded', 'false');
			setIcon(false);
			sync();
			if (restoreFocus) toggle.focus();
		};

		toggle.addEventListener('click', () => {
			const open = document.body.classList.toggle('menu-open');
			toggle.setAttribute('aria-expanded', String(open));
			setIcon(open);
			sync();
			if (open) nav.querySelector('a')?.focus();
		});

		$$('.navbar a').forEach((link) => link.addEventListener('click', () => close(false)));

		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && document.body.classList.contains('menu-open')) close(true);
		});

		mq.addEventListener('change', () => {
			if (!mq.matches) close(false);
			sync();
		});
		sync();
	}

	/* ------------------------------------------------------------------------
	   5. Reveal on scroll (IntersectionObserver)
	   ------------------------------------------------------------------------ */
	function revealAll() {
		$$('.reveal').forEach((el) => el.classList.add('is-visible'));
	}

	function initReveal() {
		const items = $$('.reveal');
		if (!items.length) return;

		if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			revealAll();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
		);
		items.forEach((el) => observer.observe(el));
	}

	/* ------------------------------------------------------------------------
	   6. CV Modal (focus trapped, PDF loaded on demand)
	   ------------------------------------------------------------------------ */
	function initCvModal() {
		const modal = $('#cv-modal');
		if (!modal) return;

		const openers = $$('[data-open-cv]');
		const closeBtn = $('#cv-modal-close');
		const frame = $('#cv-frame');
		let lastOpener = null;

		const focusables = () => $$(FOCUSABLE, modal).filter((el) => el.getClientRects().length > 0);

		const open = (opener) => {
			lastOpener = opener || null;
			modal.hidden = false;
			document.body.style.overflow = 'hidden';
			/* The PDF is ~130 KB: only request it the first time it is needed. */
			if (frame && !frame.getAttribute('src') && frame.dataset.src) {
				frame.setAttribute('src', frame.dataset.src);
			}
			closeBtn?.focus();
		};

		const close = () => {
			modal.hidden = true;
			document.body.style.overflow = '';
			if (lastOpener && typeof lastOpener.focus === 'function') lastOpener.focus();
			else openers[0]?.focus();
		};

		openers.forEach((btn) => btn.addEventListener('click', (e) => {
			e.preventDefault();
			open(btn);
		}));

		modal.addEventListener('click', (e) => {
			if (e.target.closest('[data-close-cv]')) close();
		});

		document.addEventListener('keydown', (e) => {
			if (modal.hidden) return;
			if (e.key === 'Escape') {
				close();
				return;
			}
			if (e.key !== 'Tab') return;

			/* Trap the focus inside the dialog. */
			const items = focusables();
			if (!items.length) return;
			const first = items[0];
			const last = items[items.length - 1];
			const active = document.activeElement;

			if (!modal.contains(active)) {
				e.preventDefault();
				first.focus();
			} else if (e.shiftKey && active === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
		});
	}

	/* ------------------------------------------------------------------------
	   7. Copy email
	   ------------------------------------------------------------------------ */
	function initCopyEmail() {
		const btn = $('#copy-email');
		if (!btn) return;
		const email = 'vaglegra91@gmail.com';
		const label = btn.querySelector('span');

		btn.addEventListener('click', async () => {
			try {
				await navigator.clipboard.writeText(email);
			} catch {
				/* Fallback for older browsers */
				const ta = document.createElement('textarea');
				ta.value = email;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				try { document.execCommand('copy'); } catch (err) { /* ignore */ }
				document.body.removeChild(ta);
			}
			btn.classList.add('is-copied');
			if (label) label.textContent = t('contact_email_copied', 'Copied!');
			setTimeout(() => {
				btn.classList.remove('is-copied');
				if (label) {
					const value = state.texts ? state.texts[label.dataset.text] : '';
					label.textContent = typeof value === 'string' && value.length ? value : 'Copy';
				}
			}, 1800);
		});
	}

	/* ------------------------------------------------------------------------
	   8. Contact form (EmailJS)
	   ------------------------------------------------------------------------ */
	const EMAILJS_PUBLIC_KEY = '2YPcm-rA0h-8vmvxg';
	const EMAILJS_SERVICE = 'contact_service';
	const EMAILJS_TEMPLATE = 'contact_form';

	function initContactForm() {
		const form = $('#contactForm');
		if (!form) return;

		const submitBtn = $('#contact-submit');
		const btnLabel = submitBtn?.querySelector('.btn-label');
		const feedback = $('#form-feedback');

		const setInvalid = (field, invalid) => {
			field.classList.toggle('is-invalid', invalid);
			if (invalid) field.setAttribute('aria-invalid', 'true');
			else field.removeAttribute('aria-invalid');
		};

		const isInvalidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

		/* Live validation, exposed to assistive tech through aria-invalid. */
		$$('input, textarea', form).forEach((field) => {
			field.addEventListener('blur', () => {
				if (field.required && !field.value.trim()) setInvalid(field, true);
				else if (field.type === 'email' && field.value && !isInvalidEmail(field.value)) setInvalid(field, true);
				else setInvalid(field, false);
			});
			field.addEventListener('input', () => setInvalid(field, false));
		});

		const say = (message, stateName) => {
			if (!feedback) return;
			feedback.textContent = message;
			feedback.className = 'form-feedback' + (stateName ? ' ' + stateName : '');
		};

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (!feedback) return;

			const data = {
				from_name: form.name.value.trim(),
				user_email: form.email.value.trim(),
				subject: form.subject.value.trim(),
				message: form.message.value.trim()
			};

			/* Basic validation */
			if (!data.from_name || !data.user_email || !data.message) {
				say('⚠ ' + t('contact_form_invalid', 'Please fill in name, email and message.'), 'is-error');
				form.name.focus();
				return;
			}
			if (!isInvalidEmail(data.user_email)) {
				say('⚠ ' + t('contact_form_invalid_email', 'Please enter a valid email.'), 'is-error');
				form.email.focus();
				return;
			}

			const sendText = btnLabel?.textContent || 'Send';
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.classList.add('is-loading');
				if (btnLabel) btnLabel.textContent = t('contact_form_sending', 'Sending…');
			}
			say('', '');

			try {
				if (typeof emailjs === 'undefined') throw new Error('EmailJS not loaded');
				await emailjs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, data);
				say('✓ ' + t('contact_form_success', "Message sent. I'll get back to you soon."), 'is-success');
				form.reset();
			} catch (err) {
				console.error('EmailJS error:', err);
				say('✕ ' + t('contact_form_error', "Couldn't send. Please email me directly."), 'is-error');
			} finally {
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.classList.remove('is-loading');
					if (btnLabel) btnLabel.textContent = sendText;
				}
			}
		});

		/* Init EmailJS */
		if (typeof emailjs !== 'undefined') {
			emailjs.init(EMAILJS_PUBLIC_KEY);
		}
	}

	/* ------------------------------------------------------------------------
	   9. Year
	   ------------------------------------------------------------------------ */
	function setCurrentYear() {
		const el = $('#current-year');
		if (el) el.textContent = String(new Date().getFullYear());
	}

	/* ------------------------------------------------------------------------
	   Bootstrap
	   ------------------------------------------------------------------------ */
	function init() {
		try {
			setCurrentYear();
			initTheme();
			initLanguage();
			initHeader();
			initMobileMenu();
			initReveal();
			initCvModal();
			initCopyEmail();
			initContactForm();
		} catch (err) {
			/* Never leave the page blank because of a script error. */
			console.error('Init failed:', err);
			revealAll();
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
