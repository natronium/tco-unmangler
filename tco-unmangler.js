// If it matters, this thing's licensed under the
// BSD 0-clause or CC0. Take your pick.

console.debug('t.co-sucks loaded');

function unmangleTcoLinks(node){
  //  Old fashioned links (like your grandma used to make)
  //  are <a>s with a `data-expanded-url` attribute which
  //  contains the full link
  node.querySelectorAll('a[data-expanded-url]').forEach(
    function(anchor){anchor.href = anchor.dataset.expandedUrl}
  )
}

function unmangleMobileTcoLinks(node){
  node.querySelectorAll('span._1piKw1fp').forEach(function(span){
    // This is probably overkill, but I don't know how
    // sanitized those links really are, and I'm not sure
    // how much I trust twitter.
    var probablySafeURL = span.innerHTML.replace(
      /\(link: (https?:.*)\) /, '$1'
    );
    try {
      var parsedURL = new URL(probablySafeURL);
      if (parsedURL.protocol !== 'http:' && parsedURL.protocol !== 'https:'){
        throw 'link protocol wasn\'t http(s). PANIC PANIC PANIC';
      }
      console.debug(span, ' in ', node, ' will now point to ' + parsedURL);
      span.parentNode.href = parsedURL;
    } catch(e){
      console.debug('Twitter put something funky in their span', span);
    }
  });
}



// Mobile and desktop twitter require different mangling
var desktopObserver = new MutationObserver(function(mutations){
  //
  // Desktop: Turns out there are two kinds of link!
  //
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node){

      if (node.nodeName === 'LI'){
        // The mutations we care about are the ones that
        // insert <li>s into the DOM. Those are new tweets.
        unmangleTcoLinks(node)
      } else if (node.nodeName === 'IFRAME'){
        // Uhhhhh
      }

    })
  });
});

var mobileObserver = new MutationObserver(function(mutations){
  mutations.forEach(function(mutation) {
    mutation.addedNodes.forEach(function(node) {

      // Divs for individual tweets
      // Sections for the initial bulk page creation
      if (node.nodeName === 'DIV' || node.nodeName === 'SECTION'){
        unmangleMobileTcoLinks(node)
      } 

      // There's no way to deal with cards on the mobile
      // site :(

    });
  });
});



var observerConfig = {
  //childList means we're following node addition/removal
  //mutation events and nothing else
  'childList': true,
  //subtree means that we're getting mutation events for
  //changes that happen to the target's descendants
  //(all the way down)
  'subtree': true
}


if (document.location.hostname === 'twitter.com'){
  unmangleTcoLinks(document);
  desktopObserver.observe(document, observerConfig);
} else if (document.location.hostname === 'mobile.twitter.com'){
  mobileObserver.observe(document, observerConfig);
  unmangleMobileTcoLinks(document);
}

