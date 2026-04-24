def build_onchain_indexer(settings, session_factory, contracts_registry):
    """Build the onchain event indexer for Arc."""
    if not settings.onchain_indexer_enabled or not settings.arc_rpc_url:
        return None
    try:
        from app.indexer.evm_indexer import EVMIndexer
        return EVMIndexer(
            rpc_url=settings.arc_rpc_url,
            chain_id=settings.arc_chain_id,
            contracts_registry=contracts_registry,
            session_factory=session_factory,
            poll_seconds=settings.onchain_indexer_poll_seconds,
            confirmation_depth=settings.onchain_indexer_confirmation_depth,
            bootstrap_block=settings.onchain_indexer_bootstrap_block,
            max_block_span=settings.onchain_indexer_max_block_span,
        )
    except Exception:
        return None
